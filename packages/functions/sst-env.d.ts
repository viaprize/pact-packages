/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "AUTH_GOOGLE_ID": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "AUTH_GOOGLE_SECRET": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "AUTH_RESEND_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "AUTH_SECRET": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "AUTH_TRUST_HOST": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "CacheTable": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "DATABASE_URL": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "EventBus": {
      "arn": string
      "name": string
      "type": "sst.aws.Bus"
    }
    "GASLESS_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ImageUploads": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "LOOPS_API_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "NORMIE_TECH_API_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "NORMIE_TECH_SECRET_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "NORMIE_TECH_URL": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "OPENAI_API_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "RPC_URL": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "SECRET_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ScheduleReceivingLambda": {
      "arn": string
      "type": "sst.aws.Function"
    }
    "schedulerRole": {
      "arn": string
      "type": "aws.iam/role.Role"
    }
    "website": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
  }
}
