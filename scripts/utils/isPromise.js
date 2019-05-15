const isPromise = fn => typeof fn.then === 'function';

export default isPromise;
