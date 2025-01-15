class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        const item = this.cache.get(key);
        if (item) {
            // מחיקה והוספה מחדש כדי לעדכן את הסדר
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // מחיקת הערך הישן ביותר
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }
}

class LocationSearchCache {
    constructor() {
        this.cache = new LRUCache(100);
    }

    async search(searchText, searchFn) {
        const cacheKey = searchText.toLowerCase();
        
        if (this.cache.has(cacheKey)) {
            console.log('Cache hit for:', searchText);
            return this.cache.get(cacheKey);
        }

        console.log('Cache miss for:', searchText);
        const results = await searchFn(searchText);
        this.cache.set(cacheKey, results);
        return results;
    }

    clear() {
        this.cache.clear();
    }
}

export const locationSearchCache = new LocationSearchCache();
