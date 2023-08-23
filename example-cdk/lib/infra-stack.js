const { Stack, Duration } = require('aws-cdk-lib');
const ecs = require('aws-cdk-lib/aws-ecs');
const ec2 = require('aws-cdk-lib/aws-ec2');
const iam = require('aws-cdk-lib/aws-iam');

class InfraStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const bucket_name = 'kloudcover'

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: 'vpc-849531e0',
    });


    // Get the kloudcover cluster from ecs 
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      vpc: vpc,
      clusterName: 'production-kloudcover-v3'
    });
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef');

    taskDefinition.addVolume({
      name: bucket_name,
      dockerVolumeConfiguration: {
        drive: 'bind',
        scope: ecs.Scope.SHARED,
        autoprovision: true,
      },

      // host: {
      //   sourcePath: `/mnt/s3`,
      // },
    })

    // add s3 policy to the task definition
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "s3:ListBucket",
        ],
        resources: [
          `arn:aws:s3:::${bucket_name}`,
        ]
      })
    )
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "s3:GetObject",
          "s3:PutObject",
          "s3:AbortMultipartUpload",
          "s3:DeleteObject"
        ],
        resources: [
          `arn:aws:s3:::${bucket_name}/*`
        ]
      })
    )

    // add ktruckenmiller/aws-mountpoint-s3 container that is a dependency to the next container and shares a volume 
    const mountpoint = taskDefinition.addContainer('mountpoint', {
      image: ecs.ContainerImage.fromRegistry('ktruckenmiller/aws-mountpoint-s3'),
      memoryLimitMiB: 70,
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'mountpoint',
      }),
      environment: {
        S3_BUCKET: bucket_name,
        S3_MOUNTPOINT: `/mountpoint/${bucket_name}`,
      },
      privileged: true,
      essential: true,
      linuxParameters: new ecs.LinuxParameters(this, 'LinuxParameters', {
        devices: [
          {
            hostPath: '/dev/fuse',
            containerPath: '/dev/fuse',
            permissions: ['read', 'write'],
          },
        ],
      }),

    });
    const cfnTaskDef = taskDefinition.node.defaultChild;
    cfnTaskDef.addOverride('Properties.ContainerDefinitions.0.LinuxParameters.Devices', [
      {
        hostPath: '/dev/fuse',
        containerPath: '/dev/fuse',
        permissions: ['read', 'write'],
      },
    ]);


    // mountpoint.node.linuxParameters = new ecs.LinuxParameters(this, 'LinuxParameters', {
    //   devices: [
    //     {
    //       hostPath: '/dev/fuse',
    //       containerPath: '/dev/fuse',
    //       permissions: ['read', 'write'],
    //     },
    //   ],
    // }),
    // cfnBucket.addOverride('Properties.VersioningConfiguration.Status', 'NewStatus');
    // ecs.CfnTaskDefinition.LinuxParametersProperty = {
    //   capabilities: {
    //     add: ['add'],
    //     drop: ['drop'],
    //   },
    //   devices: [{
    //     containerPath: 'containerPath',
    //     hostPath: 'hostPath',
    //     permissions: ['permissions'],
    //   }],
    //   initProcessEnabled: false,
    //   maxSwap: 123,
    //   sharedMemorySize: 123,
    //   swappiness: 123,
    //   tmpfs: [{
    //     size: 123,

    //     // the properties below are optional
    //     containerPath: 'containerPath',
    //     mountOptions: ['mountOptions'],
    //   }],
    // };


    mountpoint.addMountPoints({
      containerPath: `/mountpoint`,
      readOnly: false,
      sourceVolume: bucket_name,
    });

    // Add a container to the task definition
    const container = taskDefinition.addContainer('list-s3', {
      image: ecs.ContainerImage.fromAsset('./'),
      memoryLimitMiB: 30,
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'mountpoint',
      }),
    });

    container.addMountPoints(
      {
        containerPath: `/mountpoint/${bucket_name}`,
        readOnly: false,
        sourceVolume: bucket_name,
      }
    )


    container.addContainerDependencies({
      container: mountpoint,
      condition: ecs.ContainerDependencyCondition.START,
    });
    const service = new ecs.Ec2Service(this, 's3lister', {
      cluster,
      taskDefinition,
      desiredCount: 1,

    });
  }
}

module.exports = { InfraStack }
