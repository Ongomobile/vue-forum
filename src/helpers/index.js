export const findById = (resources, id) => resources.find((r) => r.id === id)

// Update resource if it exists othewise add resource update & insert

export const upsert = (resources, resource) => {
  const index = resources.findIndex((p) => p.id === resource.id)
  if (resource.id && index !== -1) {
    resources[index] = resource
  } else {
    resources.push(resource)
  }
}
