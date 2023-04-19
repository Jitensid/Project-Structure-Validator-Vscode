terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.63.0"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "vscode-extension-publisher-user"
}

variable "GITHUB_PAT_TOKEN" {
  type = string
}

variable "VSCODE_EXTENSION_SECRET_TOKEN" {
  type = string
}

resource "aws_ssm_parameter" "vscode_extension_secret_token" {
  name        = "vscode_extension_secret_token"
  description = "VSCode Extenson Secret Token Parameter Store"
  type        = "SecureString"
  value       = var.VSCODE_EXTENSION_SECRET_TOKEN
}

resource "aws_iam_role" "codebuild" {
  name = "codebuild-service-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "codebuild-service-role-cloudwatch-policy-attachment" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  role       = aws_iam_role.codebuild.name
}

resource "aws_iam_role_policy_attachment" "codebuild-service-role-ssm-parameter-store-policy-attachment" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
  role       = aws_iam_role.codebuild.name
}


resource "aws_codebuild_source_credential" "github_credentials" {
  auth_type   = "PERSONAL_ACCESS_TOKEN"
  server_type = "GITHUB"
  token       = "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"
}

resource "aws_codebuild_project" "vscode_extension_publish_build_project" {
  name           = "vscode_extension_publish_build_project"
  description    = "CodeBuild project to automatically publish vscode extension to the VSCODE Marketplace"
  build_timeout  = "5"
  queued_timeout = "5"

  service_role = aws_iam_role.codebuild.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/standard:7.0"
    type         = "LINUX_CONTAINER"
  }

  source {
    type            = "GITHUB"
    location        = "https://github.com/Jitensid/Project-Structure-Validator-Vscode.git"
    git_clone_depth = 1
    buildspec       = "buildspec.yaml"
    auth {
      type     = "OAUTH"
      resource = aws_codebuild_source_credential.github_credentials.arn
    }
  }

  source_version = "develop"
}

resource "aws_codebuild_webhook" "aws_codebuild_webhook" {
  project_name = aws_codebuild_project.vscode_extension_publish_build_project.name
  build_type   = "BUILD"
}
