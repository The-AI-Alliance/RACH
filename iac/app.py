#!/usr/bin/env python3

import aws_cdk as cdk
from root_env_stack import RootEnvStack

app_ci = "chatbots"

app = cdk.App()

RootEnvStack(app,
             id=f"""{app_ci}-dev""",
             application_ci=app_ci,
             deploy_replication=False,  # Fix the timing issue here...
             environment="dev"
             )

RootEnvStack(app,
             id=f"""{app_ci}-qa""",
             application_ci=app_ci,
             deploy_replication=True,
             environment="qa"
             )

RootEnvStack(app,
             id=f"""{app_ci}-prd""",
             application_ci=app_ci,
             deploy_replication=True,
             environment="prd"
             )
app.synth()
