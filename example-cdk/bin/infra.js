#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { InfraStack } = require('../lib/infra-stack');

const app = new cdk.App();
new InfraStack(app, 's3-mountpoint-test', {

});
