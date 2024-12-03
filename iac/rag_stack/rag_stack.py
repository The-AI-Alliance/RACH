import aws_cdk
from typing import List

from aws_cdk import (
    aws_kendra, 
    aws_iam,
    aws_s3
)

from constructs import Construct

from config.bucket_attributes import BucketAttributes

class RagStack(aws_cdk.Stack):

    def __init__(self, scope: Construct, construct_id: str, aws_environment: aws_cdk.Environment, persistance_bucket: aws_s3.Bucket, **kwargs) -> None:
        
        super().__init__(scope, construct_id, **kwargs)

        self.kendra_policy = aws_iam.Policy(self, "KendraPolicy")
        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "cloudwatch:PutMetricData"
                    ],
                    resources=[
                        "*"
                    ],
                    conditions={"StringEquals": {"cloudwatch:namespace": "AWS/Kendra"}}
                )
        )
        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                      "logs:DescribeLogGroups"  
                    ],
                    resources=[
                        "*"
                    ]
                )
        )
        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                      "logs:CreateLogGroup"  
                    ],
                    resources=[
                        f"arn:aws:logs:us-east-1:{aws_environment.account}:log-group:/aws/kendra/*"
                    ]
                )
        )
        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "logs:DescribeLogStreams",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    resources=[
                        f"arn:aws:logs:us-east-1:{aws_environment.account}:log-group:/aws/kendra/*:log-stream:*"
                    ]
                )
        )

        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "s3:GetObject"
                    ],
                    resources=[
                        persistance_bucket.arn_for_objects("*")
                    ]
                )
        )
        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "s3:ListBucket"
                    ],
                    resources=[
                        persistance_bucket.bucket_arn
                    ]
                )
        )

        self.kendra_role = aws_iam.Role(self, "KendraRole",
                                        assumed_by=aws_iam.ServicePrincipal('kendra.amazonaws.com'))
        self.kendra_role.attach_inline_policy(self.kendra_policy)        
        self.kendra = aws_kendra.CfnIndex(self, "index", 
                            role_arn=self.kendra_role.role_arn,
                            edition="DEVELOPER_EDITION",
                            description="AI Alliance RAG project",
                            name="rag-index"
                            )
        
        self.kendra_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "kendra:BatchPutDocument",
                        "kendra:BatchDeleteDocument"
                    ],
                    resources=[
                         self.kendra.attr_arn
                    ]
                )
        )

        self.data_source_policy = aws_iam.Policy(self, "KendraDataSourcePolicy")

        self.data_source_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "s3:GetObject"
                    ],
                    resources=[
                        persistance_bucket.arn_for_objects("*")
                    ]
                )
        )
        self.data_source_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "s3:ListBucket"
                    ],
                    resources=[
                        persistance_bucket.bucket_arn
                    ]
                )
        )
        self.data_source_policy.add_statements(            
            aws_iam.PolicyStatement(
                    actions=[
                        "kendra:BatchPutDocument",
                        "kendra:BatchDeleteDocument"
                    ],
                    resources=[
                         self.kendra.attr_arn
                    ]
                )
        )

        self.data_source_role = aws_iam.Role(self, "KendraDataSourceRole",
                                        assumed_by=aws_iam.ServicePrincipal('kendra.amazonaws.com'))
        self.data_source_role.attach_inline_policy(self.data_source_policy)  

        self.data_source = aws_kendra.CfnDataSource(self, "KendraDataSource",
                                                index_id=self.kendra.attr_id,
                                                type="S3",
                                                name=f"S3-{persistance_bucket.bucket_name}",
                                                role_arn=self.data_source_role.role_arn,
                                                data_source_configuration=aws_kendra.CfnDataSource.DataSourceConfigurationProperty(
                                                    s3_configuration=aws_kendra.CfnDataSource.S3DataSourceConfigurationProperty(
                                                            bucket_name=persistance_bucket.bucket_name))
                                                )