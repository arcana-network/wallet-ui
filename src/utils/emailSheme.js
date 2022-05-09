import { string } from 'yup'

const emailScheme = string().email().required()

export default emailScheme
