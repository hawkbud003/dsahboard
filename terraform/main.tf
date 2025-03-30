module "backend" {
  source                            = "./backend"
}

module "frontend" {
  source                            = "./frontend"
  backend_url = module.backend.load_balancer_dns
}