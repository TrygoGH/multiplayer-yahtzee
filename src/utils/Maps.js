export class BiMap {
  constructor() {
    /** @type {Map<any, any>} */
    this.forwardMap = new Map(); // A => B
    /** @type {Map<any, Set<any>>} */
    this.reverseMap = new Map(); // B => Set<A>
  }

  /**
   * Set a new forward (A => B) and reverse (B => A) association.
   * @param {*} aKey
   * @param {*} bValue
   */
  set(aKey, bValue) {
    // Remove previous association if exists
    if (this.forwardMap.has(aKey)) {
      const oldB = this.forwardMap.get(aKey);
      const aSet = this.reverseMap.get(oldB);
      aSet?.delete(aKey);
      if (aSet?.size === 0) this.reverseMap.delete(oldB);
    }

    this.forwardMap.set(aKey, bValue);

    if (!this.reverseMap.has(bValue)) {
      this.reverseMap.set(bValue, new Set());
    }
    this.reverseMap.get(bValue).add(aKey);
  }

  getForward(aKey) {
    return this.forwardMap.get(aKey);
  }

  getReverse(bValue) {
    return this.reverseMap.get(bValue) ?? new Set();
  }

  hasA(aKey) {
    return this.forwardMap.has(aKey);
  }

  hasB(bValue) {
    return this.reverseMap.has(bValue);
  }

  deleteA(aKey) {
    const bValue = this.forwardMap.get(aKey);
    this.forwardMap.delete(aKey);

    const aSet = this.reverseMap.get(bValue);
    aSet?.delete(aKey);
    if (aSet?.size === 0) this.reverseMap.delete(bValue);
  }

  deleteB(bValue) {
    const aSet = this.reverseMap.get(bValue);
    if (aSet) {
      for (const aKey of aSet) {
        this.forwardMap.delete(aKey);
      }
      this.reverseMap.delete(bValue);
    }
  }

  clear() {
    this.forwardMap.clear();
    this.reverseMap.clear();
  }
}

export class LinkMap {
  constructor() {
    /** @type {Map<any, any>} */
    this.forwardMap = new Map(); // A => B
    /** @type {Map<any, any>} */
    this.reverseMap = new Map(); // B => A
  }

  /**
   * Set a new association (A => B) and (B => A), replacing any existing ones.
   * @param {*} aKey
   * @param {*} bValue
   */
  set(aKey, bValue) {
    // Remove old associations for aKey and bValue if they exist
    if (this.forwardMap.has(aKey)) {
      const oldB = this.forwardMap.get(aKey);
      this.reverseMap.delete(oldB);
    }
    if (this.reverseMap.has(bValue)) {
      const oldA = this.reverseMap.get(bValue);
      this.forwardMap.delete(oldA);
    }

    this.forwardMap.set(aKey, bValue);
    this.reverseMap.set(bValue, aKey);
  }

  /**
   * Get the B value associated with an A key
   * @param {*} aKey
   * @returns {*}
   */
  getForward(aKey) {
    return this.forwardMap.get(aKey);
  }

  /**
   * Get the A key associated with a B value
   * @param {*} bValue
   * @returns {*}
   */
  getReverse(bValue) {
    return this.reverseMap.get(bValue);
  }

  hasA(aKey) {
    return this.forwardMap.has(aKey);
  }

  hasB(bValue) {
    return this.reverseMap.has(bValue);
  }

  deleteA(aKey) {
    const bValue = this.forwardMap.get(aKey);
    this.forwardMap.delete(aKey);
    if (bValue !== undefined) {
      this.reverseMap.delete(bValue);
    }
  }

  deleteB(bValue) {
    const aKey = this.reverseMap.get(bValue);
    this.reverseMap.delete(bValue);
    if (aKey !== undefined) {
      this.forwardMap.delete(aKey);
    }
  }

  clear() {
    this.forwardMap.clear();
    this.reverseMap.clear();
  }
}
