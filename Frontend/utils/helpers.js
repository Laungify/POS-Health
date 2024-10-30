import { format } from 'date-fns'

export function formatDateTime(date) {
  return format(new Date(date), 'yyyy-MM-dd hh:mm aa')
}

export function formatDate(date) {
  return format(new Date(date), 'yyyy-MM-dd')
}

export function isEmptyObject(obj) {
  return obj ? Object.keys(obj).length === 0 : true
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--
  }

  return age
}
