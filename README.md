# RACH

A **RA**g-**CH**atbot framework used to demonstrate the [AI Alliance](https://github.com/The-AI-Alliance) [trust, safety](https://the-ai-alliance.github.io/trust-safety-user-guide/) and [evaluation](https://github.com/The-AI-Alliance/trust-safety-evals) initiatves.

**Chatbot without RAG:**
![alt text](./images/NoRag.png)

**Chatbot with RAG:**
![alt text](./images/Rag.png)


## Overview
![alt text](./images/Serverless.png)

This framework consists of three components implemented using Amazon Web Services (AWS) Serverless:
1. RAG storage and retrieval
2. Inference
3. User Interface

### RAG storage and retrieval
![alt text](./images/RagStack.png)

The RAG storage and retrieval components is implemented using [Amazon's Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/). It consists of two stacks:

1. Persistence Stack
    - an S3 bucket for storing RAG documents, optionally replicated across multiple regions
    - an AWS service account (IAM user) in order to access the S3 bucket external to AWS
    - all the IAM roles and policies allowing the AWS service account write only on the S3 bucket

2. RAG Stack
    - an [Amazon Kendra](https://aws.amazon.com/kendra/) instance to search and query the documents in the S3 bucket
    - all the IAM roles and policies to allow Kendra to read / index the documents in the S3 bucket

### Inference
![alt text](./images/Inference.png)

The inference engine is implemented using [Amazon's Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/). It is based on a reference implementation publised on [AWS Serverlessland](https://github.com/shafkevi/lambda-bedrock-s3-streaming-rag).

### User Interface
