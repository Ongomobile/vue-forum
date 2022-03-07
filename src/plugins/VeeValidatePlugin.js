import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate'
import { required, email, min } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import db from '@/main'
import { collection, getDocs, query, where } from 'firebase/firestore'
export default (app) => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('unique', async (value, args) => {
    let coll, field

    if (Array.isArray(args)) {
      ;[coll, field] = args
    } else {
      ;({ coll, field } = args)
    }

    const queryArgs = [collection(db, coll), where(field, '==', value)]
    const fieldQuery = query(...queryArgs)
    const querySnapshot = await getDocs(fieldQuery)
    return querySnapshot.empty
  })

  configure({
    generateMessage: localize('en', {
      messages: {
        required: '{field} is required',
        email: '{field} must be a valid email',
        min: '{field} must be 0:{min} characters long',
        unique: '{field} is already taken'
      }
    })
  })

  app.component('VeeForm', Form)
  app.component('VeeField', Field)
  app.component('VeeErrorMessage', ErrorMessage)
}
