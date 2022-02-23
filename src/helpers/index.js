export const findById = (resources, id) => {
  if (!resources) return null
  return resources.find((r) => r.id === id)
}

// Update resource if it exists othewise add resource update & insert

export const upsert = (resources, resource) => {
  const index = resources.findIndex((p) => p.id === resource.id)
  if (resource.id && index !== -1) {
    resources[index] = resource
  } else {
    resources.push(resource)
  }
}

export const docToResource = (doc) => {
  // check if doc is local resource
  if (typeof doc?.data !== 'function') return doc

  return { ...doc.data(), id: doc.id }
}

// Higher order function for mutations must be a regular function because of scope functions are hoisted
export const makeAppendChildToParentMutation = ({ parent, child }) => {
  return (state, { childId, parentId }) => {
    const resource = findById(state.items, parentId)
    if (!resource) {
      console.warn(
        `Appending ${child} ${childId} to ${parent} ${parentId} failed because the parent didn't exist`
      )
      return
    }
    resource[child] = resource[child] || []
    if (!resource[child].includes(childId)) {
      resource[child].push(childId)
    }
  }
}
