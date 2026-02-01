const API_URL = import.meta.env.VITE_API_URL;

export const consultationsApi = {
  async getConsultations(token, params) {
    const url = new URL(`${API_URL}/api/admin/consultations`);
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch consultations');
    return res.json();
  }
};
