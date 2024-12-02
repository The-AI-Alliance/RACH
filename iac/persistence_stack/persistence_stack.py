import aws_cdk
from aws_cdk.aws_s3 import CfnBucket
from typing import List

from aws_cdk import (
    aws_s3, aws_iam
)

from constructs import Construct

from config.bucket_attributes import BucketAttributes

class PersistenceStack(aws_cdk.Stack):

    def __init__(self, scope: Construct, construct_id: str, bucket_name: str,
                 target_buckets: List[BucketAttributes], deploy_replication: bool, **kwargs) -> None:
        
        super().__init__(scope, construct_id, **kwargs)

        replication_role = aws_iam.Role(self, 'ReplicationRole',
                                        assumed_by=aws_iam.ServicePrincipal('s3.amazonaws.com'),
                                        )
        replication_role.assume_role_policy.add_statements(
            aws_iam.PolicyStatement(
                actions=["sts:AssumeRole"],
                principals=[aws_iam.ServicePrincipal('batchoperations.s3.amazonaws.com')]
            )
        )
        target_bucket_objects = []
        if deploy_replication:
            target_bucket_objects = [aws_s3.Bucket.from_bucket_attributes(self,
                                                                          id=tb["id"],
                                                                          account=tb["account"],
                                                                          bucket_name=tb["bucket_name"],
                                                                          region=tb["region"],
                                                                          ) for tb in target_buckets]

        self.rag_bucket = aws_s3.Bucket(self, "RagBucket",
                                              block_public_access=aws_s3.BlockPublicAccess.BLOCK_ALL,
                                              encryption=aws_s3.BucketEncryption.S3_MANAGED,
                                              bucket_name=bucket_name,
                                              enforce_ssl=True,
                                              versioned=True,
                                              )
        if deploy_replication:
            cfn_bucket: CfnBucket = self.rag_bucket.node.default_child

            cfn_bucket.replication_configuration = aws_s3.CfnBucket.ReplicationConfigurationProperty(
                role=replication_role.role_arn,
                rules=[aws_s3.CfnBucket.ReplicationRuleProperty(
                    destination=aws_s3.CfnBucket.ReplicationDestinationProperty(
                        bucket=bucket.bucket_arn
                    ),
                    status="Enabled"
                ) for bucket in target_bucket_objects],
            )

        self.user = aws_cdk.aws_iam.User(self, id="-svc")
        self.user_policy = aws_cdk.aws_iam.Policy(self, "UserRagBuckettRead")
        self.user_policy.add_statements(
            aws_iam.PolicyStatement(
                    actions=[
                        "s3:PutObject"
                    ],
                    resources=[
                        self.rag_bucket.arn_for_objects("*")
                    ]
                )           
            )

        replication_role.add_to_policy(
            aws_iam.PolicyStatement(
                actions=[
                    "s3:GetObjectVersionForReplication",
                    "s3:GetObjectVersionAcl",
                    "s3:GetObjectVersionTagging"
                ],
                resources=[
                    self.rag_bucket.arn_for_objects("*"),
                ]
            ))
        replication_role.add_to_policy(
            aws_iam.PolicyStatement(
                actions=[
                    "s3:ListBucket",
                    "s3:GetReplicationConfiguration"
                ],
                resources=[
                    self.rag_bucket.bucket_arn,
                ]
            ),
        )
        for bucket in target_bucket_objects:
            replication_role.add_to_policy(
                aws_iam.PolicyStatement(
                    actions=[
                        "s3:ReplicateObject",
                        "s3:ReplicateDelete",
                        "s3:ReplicateTags"
                    ],
                    resources=[
                        bucket.arn_for_objects("*"),
                    ]
                ),
            )
            self.user_policy.add_statements(
                aws_iam.PolicyStatement(
                    actions=[
                        "s3:PutObject"
                    ],
                    resources=[
                        bucket.arn_for_objects("*")
                    ]
                )           
            )

        self.user.attach_inline_policy(self.user_policy)