export const getId =()=>{
    return localStorage.getItem('id')
};

export const isAuthenticated = ()=>{
    const id = getId();
    console.log(id);
    return !!id;
};