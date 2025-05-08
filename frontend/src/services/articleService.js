import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * From https://www.npmjs.com/package/nestjs-paginate Documentation:
 * Get articles with pagination support
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (starts from 1)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortOrder - Sort order ('ASC' or 'DESC')
 * @param {string} options.search - Search query
 * @param {Object} options.filter - Filter options
 * @returns {Promise<Object>} - Paginated response with data, meta and links
 */
export const getArticles = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'DESC',
      search = '',
      filter = {}
    } = options;

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    params.append('sortBy', `${sortBy}:${sortOrder}`);
    
    if (search) {
      params.append('search', search);
    }
    
    // Add filter parameters
    Object.entries(filter).forEach(([key, value]) => {
      if (value) {
        params.append(`filter.${key}`, value);
      }
    });

    const response = await axios.get(`${API_URL}/articles`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};

/**
 * Get articles sorted by user category preferences
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (starts from 1)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Search query
 * @param {Object} options.filter - Filter options
 * @param {string} options.category - Specific category to filter by
 * @param {Object} options.biases - User category biases (only needed for non-authenticated users)
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortOrder - Sort order ('ASC' or 'DESC')
 * @param {boolean} options.debug - Whether to include debug information (like scores)
 * @returns {Promise<Object>} - Paginated response with sorted data, meta and links
 */
export const getSortedArticles = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      filter = {},
      category = null,
      biases = null,
      sortBy = 'publishedAt',
      sortOrder = 'DESC',
      debug = false
    } = options;

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    params.append('sortBy', `${sortBy}:${sortOrder}`);
    
    if (search) {
      params.append('search', search);
    }
    
    // Add filter parameters
    Object.entries(filter).forEach(([key, value]) => {
      if (value) {
        params.append(`filter.${key}`, value);
      }
    });
    
    // Add category filter if provided
    if (category) {
      params.append('filter.categories', JSON.stringify([category]));
    }

    // Add biases if provided (for non-authenticated users)
    if (biases) {
      params.append('biases', JSON.stringify(biases));
    }
    
    // Add debug flag if true
    if (debug) {
      params.append('debug', 'true');
    }

    // Make request to the new sorted endpoint
    const response = await axios.get(`${API_URL}/articles/sorted`, {
      params,
      withCredentials: true // Important to send cookies for authentication
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching sorted articles:", error);
    throw error;
  }
};
