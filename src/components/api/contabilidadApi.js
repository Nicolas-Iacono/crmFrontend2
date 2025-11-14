import http from './http';
class ContabilidadApi {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
  }

  getAxiosConfig() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Get all income records for a user
   * @param {number} usuarioId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Income records
   */
  async getIngresos(usuarioId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.mes) params.append('mes', filters.mes);
      if (filters.año) params.append('año', filters.año);
      if (filters.categoria) params.append('categoria', filters.categoria);

      const response = await http.get(
        `${this.baseURL}/contabilidad/ingresos/${usuarioId}?${params}`,
        this.getAxiosConfig()
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener los ingresos'
      };
    }
  }

  /**
   * Create a new income record
   * @param {Object} ingresoData - Income data
   * @param {number} ingresoData.usuarioId - User ID
   * @param {string} ingresoData.concepto - Income concept
   * @param {number} ingresoData.monto - Amount
   * @param {string} ingresoData.categoria - Category
   * @param {Date} ingresoData.fecha - Date
   * @param {string} ingresoData.descripcion - Description (optional)
   * @returns {Promise<Object>} Created income record
   */
  async createIngreso(ingresoData) {
    try {
      const response = await http.post(
        `${this.baseURL}/contabilidad/ingresos`,
        ingresoData,
        this.getAxiosConfig()
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear el ingreso'
      };
    }
  }

  /**
   * Update an income record
   * @param {number} id - Income ID
   * @param {Object} ingresoData - Updated income data
   * @returns {Promise<Object>} Updated income record
   */
  async updateIngreso(id, ingresoData) {
    try {
      const response = await http.put(
        `${this.baseURL}/contabilidad/ingresos/${id}`,
        ingresoData,
        this.getAxiosConfig()
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el ingreso'
      };
    }
  }

  /**
   * Delete an income record
   * @param {number} id - Income ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteIngreso(id) {
    try {
      await http.delete(
        `${this.baseURL}/contabilidad/ingresos/${id}`,
        this.getAxiosConfig()
      );
      return {
        success: true,
        message: 'Ingreso eliminado correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar el ingreso'
      };
    }
  }

  /**
   * Get monthly summary
   * @param {number} usuarioId - User ID
   * @param {number} mes - Month (1-12)
   * @param {number} año - Year
   * @returns {Promise<Object>} Monthly summary
   */
  async getResumenMensual(usuarioId, mes, año) {
    try {
      const response = await http.get(
        `${this.baseURL}/contabilidad/resumen/${usuarioId}/${año}/${mes}`,
        this.getAxiosConfig()
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener el resumen mensual'
      };
    }
  }

  /**
   * Get income by category for a specific period
   * @param {number} usuarioId - User ID
   * @param {number} mes - Month (1-12)
   * @param {number} año - Year
   * @returns {Promise<Object>} Income by category
   */
  async getIngresosPorCategoria(usuarioId, mes, año) {
    try {
      const response = await http.get(
        `${this.baseURL}/contabilidad/categorias/${usuarioId}/${año}/${mes}`,
        this.getAxiosConfig()
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener ingresos por categoría'
      };
    }
  }

  /**
   * Validate income data before submission
   * @param {Object} ingresoData - Income data to validate
   * @returns {Object} Validation result
   */
  validateIngresoData(ingresoData) {
    const errors = [];

    if (!ingresoData.concepto || ingresoData.concepto.trim().length < 3) {
      errors.push('El concepto debe tener al menos 3 caracteres');
    }

    if (!ingresoData.monto || parseFloat(ingresoData.monto) <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (!ingresoData.categoria) {
      errors.push('Debe seleccionar una categoría');
    }

    if (!ingresoData.fecha) {
      errors.push('Debe seleccionar una fecha');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  /**
   * Get available categories
   * @returns {Array} Categories array
   */
  getCategorias() {
    return [
      { value: 'alquiler', label: 'Alquiler', color: 'primary' },
      { value: 'comision', label: 'Comisión', color: 'success' },
      { value: 'honorarios', label: 'Honorarios', color: 'info' },
      { value: 'sellado', label: 'Sellado', color: 'warning' },
      { value: 'gastos_admin', label: 'Gastos Administrativos', color: 'secondary' },
      { value: 'otros', label: 'Otros', color: 'default' }
    ];
  }
}

// Create and export a singleton instance
const contabilidadApi = new ContabilidadApi();
export default contabilidadApi;
