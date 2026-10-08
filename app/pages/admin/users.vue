<template>
  <div class="us-page">
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Users</h1>
        <p class="adm-page-sub">Who can sign in to this dashboard and what each person can open. Managers can open everything, including this page.</p>
      </div>
      <button v-if="isManager" type="button" class="adm-btn adm-btn-primary" @click="openCreate">
        <AdminIcon name="plus" :size="16" /> Add user
      </button>
    </div>

    <p v-if="!isManager" class="us-banner">Only managers can see and manage users.</p>
    <p v-else-if="loadError" class="adm-error us-banner">Could not load users. If you just updated the site, restart the server so the database is up to date.</p>
    <p v-if="notice" class="us-banner us-banner--ok">{{ notice }}</p>

    <div v-if="isManager && users" class="adm-card us-card">
      <table class="adm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th class="us-hide-sm">Access</th>
            <th>Status</th>
            <th class="us-hide-sm">Last sign-in</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" :class="{ 'is-inactive': !u.active }" @click="openEdit(u)">
            <td>
              <div class="us-person">
                <span class="us-avatar">{{ initials(u.name) }}</span>
                <span>
                  <span class="us-name">{{ u.name }} <span v-if="u.id === currentUserId" class="us-you">You</span></span>
                  <span class="us-email">{{ u.email }}</span>
                </span>
              </div>
            </td>
            <td><span class="us-role" :class="`is-${u.role}`">{{ u.role === 'manager' ? 'Manager' : 'Host' }}</span></td>
            <td class="us-hide-sm us-access">{{ accessSummary(u) }}</td>
            <td>
              <span v-if="!u.active" class="us-status is-off">Deactivated</span>
              <span v-else-if="u.mustChangePassword" class="us-status is-pending">Must set password</span>
              <span v-else class="us-status is-on">Active</span>
            </td>
            <td class="us-hide-sm us-muted">{{ u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never' }}</td>
            <td class="us-actions">
              <button type="button" class="adm-btn adm-btn-sm adm-btn-ghost" @click.stop="openEdit(u)">
                <AdminIcon name="edit" :size="15" /> Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / edit panel -->
    <Transition name="adm-fade">
      <div v-if="panel" class="adm-backdrop" @click="closePanel" />
    </Transition>
    <Transition name="adm-slide">
      <aside v-if="panel" class="adm-drawer" role="dialog" aria-modal="true" :aria-label="panel.mode === 'create' ? 'Add user' : 'Edit user'">
        <div class="adm-panel-head">
          <div>
            <h2 class="us-panel-title">{{ panel.mode === 'create' ? 'Add user' : 'Edit user' }}</h2>
            <p v-if="panel.mode === 'edit'" class="us-muted us-panel-sub">{{ panel.original?.email }}</p>
          </div>
          <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" @click="closePanel">
            <AdminIcon name="close" />
          </button>
        </div>

        <form id="user-form" class="adm-panel-body us-form" @submit.prevent="submit">
          <label class="adm-field">
            <span class="adm-label">Full name</span>
            <input v-model="panel.name" class="adm-input" maxlength="80" required autocomplete="off">
          </label>
          <label class="adm-field">
            <span class="adm-label">Email address</span>
            <input v-model.trim="panel.email" class="adm-input" type="email" required autocomplete="off">
            <span class="us-hint">They sign in with this email.</span>
          </label>

          <div class="adm-field">
            <span class="adm-label">Role</span>
            <div class="us-roles">
              <label class="us-role-opt" :class="{ 'is-active': panel.role === 'host' }">
                <input v-model="panel.role" type="radio" value="host" :disabled="isSelf">
                <span>
                  <strong>Host</strong>
                  <span>Only the areas you choose below.</span>
                </span>
              </label>
              <label class="us-role-opt" :class="{ 'is-active': panel.role === 'manager' }">
                <input v-model="panel.role" type="radio" value="manager" :disabled="isSelf">
                <span>
                  <strong>Manager</strong>
                  <span>Everything, plus setup pages and users.</span>
                </span>
              </label>
            </div>
            <span v-if="isSelf" class="us-hint">You can't change your own role.</span>
          </div>

          <!-- What a host can open -->
          <div v-if="panel.role === 'host'" class="adm-field us-access-block">
            <div class="us-access-head">
              <span class="adm-label">Access</span>
              <span class="us-hint">{{ panel.permissions.length }} of {{ ASSIGNABLE_ACCESS.length }} areas</span>
            </div>
            <div v-for="group in accessGroups" :key="group.label" class="us-access-group">
              <div class="us-access-group-head">
                <span class="us-access-group-label">{{ group.label }}</span>
                <button v-if="group.options.length > 2" type="button" class="us-link" @click="toggleGroup(group.options)">
                  {{ group.options.every(o => panel!.permissions.includes(o.key)) ? 'Clear all' : 'Select all' }}
                </button>
              </div>
              <label v-for="option in group.options" :key="option.key" class="us-check us-access-opt">
                <input v-model="panel.permissions" type="checkbox" :value="option.key">
                <span>
                  <strong>{{ option.label }}</strong>
                  <span>{{ option.description }}</span>
                </span>
              </label>
            </div>
            <p v-if="!panel.permissions.length" class="us-warn">Nothing is ticked, so this user will only see a "No access yet" page.</p>
          </div>
          <p v-else class="us-hint us-manager-note">Managers can open every area and every website page, and manage users.</p>

          <!-- Password -->
          <div class="us-pw-block">
            <div class="us-pw-head">
              <span class="adm-label">{{ panel.mode === 'create' ? 'Password' : 'Set a new password' }}</span>
              <button v-if="panel.mode === 'edit' && !panel.changePassword" type="button" class="us-link" @click="panel.changePassword = true">
                Reset password
              </button>
            </div>

            <template v-if="panel.mode === 'create' || panel.changePassword">
              <div class="us-pw-row">
                <input
                  v-model="panel.password"
                  class="adm-input us-pw-input"
                  :type="panel.showPassword ? 'text' : 'password'"
                  :minlength="MIN_PASSWORD"
                  autocomplete="new-password"
                  :placeholder="`At least ${MIN_PASSWORD} characters`"
                  :required="panel.mode === 'create'"
                >
                <button type="button" class="adm-btn adm-btn-sm" @click="panel.showPassword = !panel.showPassword">
                  {{ panel.showPassword ? 'Hide' : 'Show' }}
                </button>
                <button type="button" class="adm-btn adm-btn-sm" @click="generatePassword">Generate</button>
              </div>
              <div class="us-meter" :class="`is-${strength.level}`">
                <span v-for="n in 4" :key="n" :class="{ 'is-on': n <= strength.score }" />
                <em>{{ strength.label }}</em>
              </div>
              <button v-if="panel.password" type="button" class="us-link us-copy" @click="copyPassword">
                {{ copied ? 'Copied ✓' : 'Copy password' }}
              </button>

              <label class="us-check">
                <input v-model="panel.mustChangePassword" type="checkbox">
                <span>
                  <strong>Ask them to set their own password when they first sign in</strong>
                  <span>Recommended. Share this password with them once; they'll replace it before using the dashboard.</span>
                </span>
              </label>
            </template>
            <p v-else class="us-hint">Leave as is to keep their current password.</p>
          </div>

          <!-- Status (edit only) -->
          <div v-if="panel.mode === 'edit'" class="us-status-block">
            <label class="us-check" :class="{ 'is-disabled': isSelf }">
              <input v-model="panel.active" type="checkbox" :disabled="isSelf">
              <span>
                <strong>Account active</strong>
                <span>{{ isSelf ? 'You can\'t deactivate your own account.' : 'Untick to block sign-in. They are signed out straight away.' }}</span>
              </span>
            </label>
          </div>

          <!-- Delete (edit only, not yourself) -->
          <div v-if="panel.mode === 'edit' && !isSelf" class="us-danger">
            <div>
              <strong>Delete user</strong>
              <span>Removes {{ panel.original?.name }} for good. Their bookings and activity history stay; only their name is cleared from them. To pause access instead, untick "Account active".</span>
            </div>
            <button type="button" class="adm-btn adm-btn-sm us-delete-btn" :disabled="saving" @click="deleteUser">
              <AdminIcon name="trash" :size="15" /> Delete
            </button>
          </div>

          <p v-if="panelError" class="adm-error">{{ panelError }}</p>
        </form>

        <div class="adm-panel-foot">
          <button type="button" class="adm-btn" @click="closePanel">Cancel</button>
          <button type="submit" form="user-form" class="adm-btn adm-btn-primary" :disabled="saving">
            {{ saving ? 'Saving…' : panel.mode === 'create' ? 'Create user' : 'Save changes' }}
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ASSIGNABLE_ACCESS, DEFAULT_HOST_ACCESS } from '#shared/utils/permissions'
import type { AccessOption } from '#shared/utils/permissions'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Users · YANA admin' })

const MIN_PASSWORD = 12

interface StaffUser {
  id: number
  name: string
  email: string
  role: 'manager' | 'host'
  active: boolean
  mustChangePassword: boolean
  permissions: string[]
  createdAt: string
  lastLoginAt: string | null
}

interface Panel {
  mode: 'create' | 'edit'
  original?: StaffUser
  name: string
  email: string
  role: 'manager' | 'host'
  active: boolean
  password: string
  showPassword: boolean
  changePassword: boolean
  mustChangePassword: boolean
  permissions: string[]
}

const { ready, isManager } = useAdminAccess()
await ready

const { data, error: fetchError, refresh } = await useFetch<{ users: StaffUser[], currentUserId: number }>('/api/admin/staff', {
  immediate: isManager.value
})
const users = computed(() => data.value?.users ?? null)
const currentUserId = computed(() => data.value?.currentUserId)
const loadError = computed(() => !!fetchError.value)

const panel = ref<Panel | null>(null)
const panelError = ref('')
const saving = ref(false)
const notice = ref('')
const copied = ref(false)

const isSelf = computed(() => panel.value?.mode === 'edit' && panel.value.original?.id === currentUserId.value)

const initials = (name: string) => name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
// The access checklist, in the same groups as the sidebar.
const accessGroups = (['Service', 'Insights', 'Setup', 'Website content'] as const).map(label => ({
  label,
  options: ASSIGNABLE_ACCESS.filter(a => a.group === label)
}))

function toggleGroup(options: AccessOption[]) {
  const p = panel.value
  if (!p) return
  const keys = options.map(o => o.key)
  const allOn = keys.every(k => p.permissions.includes(k))
  p.permissions = allOn ? p.permissions.filter(k => !keys.includes(k)) : [...new Set([...p.permissions, ...keys])]
}

// "Reservations, Guests +3" for the users table.
function accessSummary(u: StaffUser) {
  if (u.role === 'manager') return 'Everything'
  const labels = ASSIGNABLE_ACCESS.filter(a => u.permissions.includes(a.key))
    .map(a => a.group === 'Website content' ? `${a.label} page` : a.label)
  if (!labels.length) return 'No access'
  return labels.length > 3 ? `${labels.slice(0, 3).join(', ')} +${labels.length - 3}` : labels.join(', ')
}

const formatDate = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function openCreate() {
  panelError.value = ''
  panel.value = {
    mode: 'create', name: '', email: '', role: 'host', active: true,
    password: '', showPassword: false, changePassword: true, mustChangePassword: true,
    permissions: [...DEFAULT_HOST_ACCESS]
  }
}

function openEdit(u: StaffUser) {
  if (!isManager.value) return
  panelError.value = ''
  panel.value = {
    mode: 'edit', original: u, name: u.name, email: u.email, role: u.role, active: u.active,
    password: '', showPassword: false, changePassword: false, mustChangePassword: true,
    permissions: [...u.permissions]
  }
}

function closePanel() {
  panel.value = null
  copied.value = false
}

// Readable but strong: no look-alike characters (0/O, 1/l/I).
function generatePassword() {
  if (!panel.value) return
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?'
  const bytes = crypto.getRandomValues(new Uint32Array(16))
  panel.value.password = Array.from(bytes, b => chars[b % chars.length]).join('')
  panel.value.showPassword = true
  copied.value = false
}

async function copyPassword() {
  if (!panel.value?.password) return
  try {
    await navigator.clipboard.writeText(panel.value.password)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

const strength = computed(() => {
  const pw = panel.value?.password ?? ''
  if (!pw) return { score: 0, level: 'none', label: '' }
  if (pw.length < MIN_PASSWORD) return { score: 1, level: 'weak', label: `Too short (${pw.length}/${MIN_PASSWORD})` }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length
  const score = Math.min(4, 1 + (pw.length >= 16 ? 1 : 0) + (variety >= 3 ? 1 : 0) + (variety === 4 ? 1 : 0))
  return { score, level: score >= 3 ? 'good' : 'ok', label: score >= 3 ? 'Strong' : 'Okay' }
})

function flash(message: string) {
  notice.value = message
  setTimeout(() => { if (notice.value === message) notice.value = '' }, 5000)
}

async function deleteUser() {
  const p = panel.value
  if (!p?.original) return
  if (!confirm(`Delete ${p.original.name} (${p.original.email}) permanently? This can't be undone.`)) return
  panelError.value = ''
  saving.value = true
  try {
    await $fetch(`/api/admin/staff/${p.original.id}`, { method: 'DELETE' })
    flash(`${p.original.name} has been deleted.`)
    closePanel()
    await refresh()
  } catch (err: any) {
    panelError.value = err?.data?.statusMessage || 'Could not delete this user.'
  } finally {
    saving.value = false
  }
}

async function submit() {
  const p = panel.value
  if (!p) return
  panelError.value = ''

  const settingPassword = p.mode === 'create' || (p.changePassword && !!p.password)
  if (settingPassword && p.password.length < MIN_PASSWORD) {
    panelError.value = `Password must be at least ${MIN_PASSWORD} characters.`
    return
  }

  saving.value = true
  try {
    if (p.mode === 'create') {
      await $fetch('/api/admin/staff', {
        method: 'POST',
        body: { name: p.name, email: p.email, role: p.role, permissions: p.permissions, password: p.password, mustChangePassword: p.mustChangePassword }
      })
      flash(`${p.name} can now sign in${p.mustChangePassword ? ' and will be asked to set their own password' : ''}.`)
    } else {
      const body: Record<string, unknown> = { name: p.name, email: p.email, active: p.active, permissions: p.permissions }
      if (!isSelf.value) body.role = p.role
      if (settingPassword) {
        body.password = p.password
        body.mustChangePassword = p.mustChangePassword
      }
      await $fetch(`/api/admin/staff/${p.original!.id}`, { method: 'PATCH', body })
      flash(settingPassword ? `Password updated for ${p.name}.` : `${p.name} updated.`)
    }
    closePanel()
    await refresh()
  } catch (err: any) {
    panelError.value = err?.data?.statusMessage || 'Could not save this user.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.us-banner {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  border: 1px solid var(--adm-line);
  font-size: 13px;
}

.us-banner--ok {
  border-color: rgba(30, 138, 90, 0.3);
  background: rgba(30, 138, 90, 0.07);
  color: #17704a;
}

.us-card {
  overflow: hidden;
}

.us-person {
  display: flex;
  align-items: center;
  gap: 12px;
}

.us-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--adm-nav);
  color: var(--adm-accent);
  font-size: 12.5px;
  font-weight: 600;
}

.us-name {
  display: block;
  font-weight: 500;
  color: var(--adm-text);
}

.us-you {
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(217, 182, 144, 0.25);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--adm-accent-dk);
}

.us-email,
.us-muted {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.us-email {
  display: block;
  margin-top: 1px;
}

.us-role,
.us-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.us-role.is-manager {
  background: var(--adm-nav);
  color: var(--adm-accent);
}

.us-role.is-host {
  background: rgba(18, 66, 109, 0.1);
  color: var(--adm-primary);
}

.us-status::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.us-status.is-on {
  background: rgba(30, 138, 90, 0.1);
  color: var(--adm-success);
}

.us-status.is-pending {
  background: rgba(192, 138, 46, 0.12);
  color: #9a6d1f;
}

.us-status.is-off {
  background: rgba(102, 112, 122, 0.12);
  color: var(--adm-muted);
}

tr.is-inactive .us-name,
tr.is-inactive .us-avatar {
  opacity: 0.55;
}

.us-actions {
  text-align: right;
}

/* Panel */
.us-panel-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--adm-text);
}

.us-panel-sub {
  margin: 3px 0 0;
}

.us-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.us-hint {
  font-size: 12px;
  color: var(--adm-muted);
}

.us-access {
  max-width: 260px;
  font-size: 12.5px;
  color: var(--adm-text-3);
}

.us-access-block {
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
}

.us-access-head,
.us-access-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.us-access-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.us-access-group + .us-access-group {
  padding-top: 10px;
  border-top: 1px solid var(--adm-line);
}

.us-access-group-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--adm-faint);
}

.us-access-opt {
  padding: 6px 0;
}

.us-warn {
  margin: 0;
  font-size: 12.5px;
  color: var(--adm-accent-dk);
}

.us-manager-note {
  margin: -4px 0 0;
}

.us-roles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.us-role-opt {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--adm-line-strong);
  border-radius: var(--adm-radius);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.us-role-opt.is-active {
  border-color: var(--adm-primary);
  background: rgba(18, 66, 109, 0.05);
}

.us-role-opt input {
  margin-top: 2px;
  accent-color: var(--adm-primary);
}

.us-role-opt strong,
.us-check strong {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--adm-text);
}

.us-role-opt span span,
.us-check span span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--adm-muted);
}

.us-pw-block,
.us-status-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
}

.us-pw-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.us-pw-row {
  display: flex;
  gap: 6px;
}

.us-pw-input {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.us-pw-row .adm-btn {
  height: 36px;
}

.us-link {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--adm-primary);
  cursor: pointer;
}

.us-copy {
  margin-top: -4px;
}

.us-meter {
  display: flex;
  align-items: center;
  gap: 4px;
}

.us-meter span {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--adm-line);
}

.us-meter.is-weak span.is-on {
  background: var(--adm-danger);
}

.us-meter.is-ok span.is-on {
  background: #C08A2E;
}

.us-meter.is-good span.is-on {
  background: var(--adm-success);
}

.us-meter em {
  margin-left: 6px;
  font-style: normal;
  font-size: 12px;
  color: var(--adm-muted);
}

.us-check {
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.us-check input {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--adm-primary);
}

.us-check.is-disabled {
  cursor: default;
  opacity: 0.7;
}

.us-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(194, 65, 45, 0.3);
  border-radius: var(--adm-radius);
  background: rgba(194, 65, 45, 0.04);
}

.us-danger strong {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--adm-danger);
}

.us-danger span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--adm-muted);
}

.us-delete-btn {
  flex-shrink: 0;
  border-color: rgba(194, 65, 45, 0.45);
  color: var(--adm-danger);
}

.us-delete-btn:hover:not(:disabled) {
  background: var(--adm-danger);
  border-color: var(--adm-danger);
  color: #fff;
}

@media (max-width: 720px) {
  .us-hide-sm {
    display: none;
  }

  .us-roles {
    grid-template-columns: 1fr;
  }
}
</style>
