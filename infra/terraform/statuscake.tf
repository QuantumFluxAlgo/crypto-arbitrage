terraform {
  required_providers {
    statuscake = {
      source  = "StatusCakeDev/statuscake"
      version = "~> 2.0"
    }
  }
}

provider "statuscake" {
  # API token is taken from the environment variable STATUSCAKE_API_TOKEN
}

variable "api_url" {
  description = "Full URL to the API endpoint"
  type        = string
}

variable "dashboard_url" {
  description = "Full URL to the Dashboard endpoint"
  type        = string
}

variable "analytics_url" {
  description = "Full URL to the Analytics endpoint"
  type        = string
}

resource "statuscake_uptime_check" "api" {
  name = "api-uptime"
  monitored_resource {
    address = var.api_url
  }
  http_check {}
}

resource "statuscake_uptime_check" "dashboard" {
  name = "dashboard-uptime"
  monitored_resource {
    address = var.dashboard_url
  }
  http_check {}
}

resource "statuscake_uptime_check" "analytics" {
  name = "analytics-uptime"
  monitored_resource {
    address = var.analytics_url
  }
  http_check {}
}
