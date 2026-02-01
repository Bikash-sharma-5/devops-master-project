provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "devops_node" {
  ami           = "ami-0c101f26f147fa7fd" # Amazon Linux 2023
  instance_type = "t2.medium"
  key_name      = "my-key" # Change to your .pem key name
  tags = { Name = "DevOps-Server" }
}