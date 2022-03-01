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
// Higher order function to make dispatch fetchItem & fetchItems
export const makeFetchItemAction = ({ emoji, resource }) => {
  // By writing payload and spreading ...payload instead of destructing values we can send any options
  // before the payload looked like this { id, once = false}
  return ({ dispatch }, payload) =>
    dispatch('fetchItem', { emoji, resource, ...payload }, { root: true })
}
export const makeFetchItemsAction = ({ emoji, resource }) => {
  return ({ dispatch }, payload) =>
    dispatch('fetchItems', { emoji, resource, ...payload }, { root: true })
}
