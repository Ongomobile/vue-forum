import { findById, upsert, docToResource } from '@/helpers'

export default {
  setItem(state, { resource, item }) {
    upsert(state[resource], docToResource(item))
  },
  appendPostToThread: makeAppendChildToParrentMutation({
    parent: 'threads',
    child: 'posts'
  }),

  appendThreadtoForum: makeAppendChildToParrentMutation({
    parent: 'forums',
    child: 'threads'
  }),
  appendThreadtoUser: makeAppendChildToParrentMutation({
    parent: 'users',
    child: 'threads'
  }),
  appendContributorToThread: makeAppendChildToParrentMutation({
    parent: 'threads',
    child: 'contributors'
  })
}

// Higher order function for mutations must be a regular function because of scope functions are hoisted
function makeAppendChildToParrentMutation({ parent, child }) {
  return (state, { childId, parentId }) => {
    const resource = findById(state[parent], parentId)
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
