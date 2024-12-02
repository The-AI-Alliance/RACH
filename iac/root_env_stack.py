import os

import aws_cdk
import builtins

from config.bucket_attributes import BucketAttributes
from regional_stack import RegionalStack
from constructs import Construct

account_ids = {
    "dev": os.environ.get('AWS_DEV_ACCOUNT'),
    "qa": os.environ.get('AWS_QA_ACCOUNT'),
    "prd": os.environ.get('AWS_PRD_ACCOUNT')
}

class RootEnvStack(aws_cdk.Stack):
    def __init__(self, scope:Construct, 
                 deploy_replication: bool, 
                 environment: str,
                 id: builtins.str,
                 application_ci: builtins.str, 
                 **kwargs):
   
        super().__init__(scope, id)
   
        bucket_base_name = f"""{self.stack_name}-rag"""
  
        primary_bucket = BucketAttributes(
            bucket_name=f"{bucket_base_name}-us-east-1",
            region="us-east-1",
            account=self.account,
            id=f"{application_ci}Primary"
        )

        secondary_bucket = BucketAttributes(
            bucket_name=f"{bucket_base_name}-us-east-2",
            region="us-east-2",
            account=self.account,
            id=f"{application_ci}Secondary"
        )

        primary_stack = RegionalStack(self,  
                                      id="us-east-1", 
                                      source_bucket=primary_bucket,
                                      target_buckets=[secondary_bucket],
                                      deploy_replication=deploy_replication, 
                                      environment=environment,
                                      aws_environment=aws_cdk.Environment(account=account_ids[environment],
                                                                          region="us-east-1"),
                                      application_ci=application_ci)

        secondary_stack = RegionalStack(self, 
                                        id="us-east-2", 
                                        source_bucket=secondary_bucket,
                                        target_buckets=[primary_bucket],
                                        deploy_replication=deploy_replication, 
                                        environment=environment,
                                        aws_environment=aws_cdk.Environment(account=account_ids[environment],
                                                                            region="us-east-2"),
                                        application_ci=application_ci)
