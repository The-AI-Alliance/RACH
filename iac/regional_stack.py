import builtins
from typing import List

import aws_cdk

from config.bucket_attributes import BucketAttributes
from persistence_stack.persistence_stack import PersistenceStack
from rag_stack.rag_stack import RagStack
from aws_cdk.aws_kms import Key

class RegionalStack(aws_cdk.Stack):
    def __init__(self, scope, application_ci: str,
                 source_bucket: BucketAttributes, target_buckets: List[BucketAttributes], deploy_replication: bool,
                 environment: str, aws_environment: aws_cdk.Environment, id: builtins.str, **kwargs):
        
        super().__init__(scope, id, **kwargs)

        persistence_stack = PersistenceStack(self, "persistence",
                                                bucket_name=source_bucket["bucket_name"],
                                                target_buckets=target_buckets,
                                                deploy_replication=deploy_replication)
        
        rag_stack = RagStack(self, "rag", aws_environment, persistence_stack.rag_bucket)
        
        
        
