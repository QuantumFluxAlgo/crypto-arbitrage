# StatusCake Uptime Checks

This Terraform configuration provisions HTTP uptime checks for the API, dashboard, and analytics services.

The provider reads the `STATUSCAKE_API_TOKEN` from the environment. Optionally
define `STATUSCAKE_CONTACT_GROUP` to attach a contact group to all checks.
Supply the endpoint URLs via `TF_VAR_api_url`, `TF_VAR_dashboard_url`, and
`TF_VAR_analytics_url` when running `terraform apply`.
