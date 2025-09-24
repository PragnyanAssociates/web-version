// src/utils/storage.js
const storage = {
  set: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  get: (key) => {
    return Promise.resolve(localStorage.getItem(key));
  },
  remove: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
  multiRemove: (keys) => {
    keys.forEach((key) => localStorage.removeItem(key));
    return Promise.resolve();
  },
};

export default storage;
