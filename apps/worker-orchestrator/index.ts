import express from "express";
import { AutoScalingClient, SetDesiredCapacityCommand, DescribeAutoScalingInstancesCommand, TerminateInstanceInAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

const app = express();
const client = new AutoScalingClient({ region: "ap-south-1", credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
} });

const ec2Client = new EC2Client({ region: "ap-south-1", credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
}})

type Machine = {
    ip: string;
    isUsed: boolean;
    assignedProject?: string;
}

const ALL_MACHINES: Machine[] = [];

async function refershInstances() {
    const command = new DescribeAutoScalingInstancesCommand();
    const data = await client.send(command);

    const ec2InstanceCommand = new DescribeInstancesCommand({
        InstanceIds: data.AutoScalingInstances?.map(x => x.InstanceId)
    })

    const ec2Response = await ec2Client.send(ec2InstanceCommand);
    // console.log(JSON.stringify(ec2Response.Reservations[0].Instances[0].PublicDnsName))
    // TODO: Enrich the ALL_MACHINES array with the new instances, and remove the instances that have died
}

refershInstances();

setInterval(() => {
    refershInstances();
}, 10 * 1000);

app.get("/:projectId", (req, res) => {
    const idleMachine = ALL_MACHINES.find(x => x.isUsed === false);
    if (!idleMachine) {
        // scale up the infrasturcture
        res.status(404).send("No idle machine found");
        return;
    }

    idleMachine.isUsed = true;
    // scale up the infrasturcture

    const command = new SetDesiredCapacityCommand({
        AutoScalingGroupName: "vscode-asg",
        DesiredCapacity: ALL_MACHINES.length + (5 - ALL_MACHINES.filter(x => x.isUsed === false).length)

    })

    client.send(command);

    res.send({
        ip: idleMachine.ip
    });
})

app.post("/destroy", (req, res) => {
    const machineId: string = req.body.machineId;

    const command = new TerminateInstanceInAutoScalingGroupCommand({
        InstanceId: machineId,
        ShouldDecrementDesiredCapacity: true
    })

    client.send(command);
})

app.listen(9092);

