locals {
  algorithms = jsondecode(file("../../../config.json")).algorithms
}
