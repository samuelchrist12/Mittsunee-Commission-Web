export function checkIsAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const local = localStorage.getItem('mittsunee_admin_auth')
  const session = sessionStorage.getItem('mittsunee_admin_auth')
  return Boolean(local || session)
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('mittsunee_admin_auth')
  sessionStorage.removeItem('mittsunee_admin_auth')
}
