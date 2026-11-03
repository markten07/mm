/* Public progress only: never return individual voting choices to the host UI. */
window.HOST_STATE = (() => {
  const roles = ['yun', 'han', 'bak', 'yu'];
  function votes(value = {}) {
    const counts = Object.fromEntries(roles.map(key => [key, 0]));
    let done = 0;
    for (const who of roles) {
      const target = value[who];
      if (roles.includes(target) && target !== who) { counts[target]++; done++; }
    }
    return {done, all: done === roles.length, counts};
  }
  function usage(taken = {}, round, limit) {
    const used = Object.fromEntries(roles.map(key => [key, 0]));
    for (const value of Object.values(taken)) {
      const [who, phase] = String(value).split('#');
      if (roles.includes(who) && Number(phase) === round) used[who]++;
    }
    return roles.map(key => ({key, used: used[key], left: Math.max(0, limit - used[key])}));
  }
  // Temporary test setting: set false to require all four votes again.
  return {roles, votes, usage, allowIncompleteVotes: true};
})();
