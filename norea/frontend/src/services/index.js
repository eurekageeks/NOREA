import { localApi } from './localStore';

export const authService = {
  me: () => localApi.me(),
  login: (payload) => localApi.login(payload),
  register: (payload) => localApi.register(payload),
  logout: () => localApi.logout(),
  changePassword: (payload) => localApi.changePassword(payload),
};

export const programService = {
  list: (params) => localApi.listPrograms(params),
  get: (slugOrId) => localApi.getProgram(slugOrId),
  create: (payload) => localApi.createProgram(payload),
  update: (id, payload) => localApi.updateProgram(id, payload),
  remove: (id) => localApi.removeProgram(id),
};

export const enquiryService = {
  submit: (payload) => localApi.submitEnquiry(payload),
  list: (params) => localApi.listEnquiries(params),
  get: (id) => localApi.getEnquiry(id),
  update: (id, payload) => localApi.updateEnquiry(id, payload),
  remove: (id) => localApi.removeEnquiry(id),
  exportCsv: (params) => localApi.exportEnquiriesCsv(params),
};

export const studentService = {
  list: (params) => localApi.listStudents(params),
  get: (id) => localApi.getStudent(id),
  create: (payload) => localApi.createStudent(payload),
  update: (id, payload) => localApi.updateStudent(id, payload),
  remove: (id, mode = 'delete') => localApi.removeStudent(id, mode),
};

export const admissionService = {
  list: (params) => localApi.listAdmissions(params),
  create: (payload) => localApi.createAdmission(payload),
  update: (id, payload) => localApi.updateAdmission(id, payload),
  remove: (id) => localApi.removeAdmission(id),
};

export const dashboardService = {
  stats: () => localApi.stats(),
  analytics: (params) => localApi.analytics(params),
  activity: (params) => localApi.activity(params),
};

export const settingsService = {
  get: () => localApi.getSettings(),
  update: (settings) => localApi.updateSettings(settings),
};

export const userService = {
  list: () => localApi.listUsers(),
  create: (payload) => localApi.createUser(payload),
  update: (id, payload) => localApi.updateUser(id, payload),
  remove: (id) => localApi.removeUser(id),
};

export const portalService = {
  overview: () => localApi.portalOverview(),
  updateProfile: (payload) => localApi.updateMyProfile(payload),
};

export const uploadService = {
  image: (file, onProgress) => localApi.uploadImage(file, onProgress),
};
