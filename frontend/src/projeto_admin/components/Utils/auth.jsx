export const getId =()=>{
    return localStorage.getItem('id')
};

export const isAuthenticated = ()=>{
    const id = getId();
    return !!id;
};