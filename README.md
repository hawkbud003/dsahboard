# terraform-base-template

Template repository for terraform projects including CI/CD and pre-commit setup.

## Setup

### Configure your Aws credentials using the AWS CLI

```bash
aws configure --profile aws-dsp
```

### Adjust variables & placeholders

You will have to adjust certain variables and placeholders for every new project:

#### variables.tf

Please specify the correct `aws_profile` and `application_name`

#### terraform.tf

Please specify the bucket of the terraform backend bucket.

### Initialize Terraform

For the initialization of the local terraform project, you will first have to manually create the terraform backend
bucket that will be used to backup the terraform state (See above). After you have done this, you can run

```bash
terraform init
```

### Create a new workspace

The terraform workspaces are like stages. By creating a new stage, terraform will create a copy of the infrastructure
for the respective stage. To create a new workspace, run

#### Note: We are using default for now.
```bash
terraform workspace new <your workspace name>
```

or if you already have a workspace and just want to switch to it, run

```bash
terraform workspace select <your workspace name
```

### Deploy infrastructure

To deploy the changes you made to the infrastructure, please first run

```bash
terraform plan
```

to check whether all changes displayed are correct. If so, please run

```bash
terraform apply
```

And confirm with "yes" to deploy the update.
