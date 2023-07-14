const formatYMD = (date) => {
    const year = date.toLocaleString('default', {year: 'numeric'});
    const month = date.toLocaleString('default', {month: '2-digit'});
    const day = date.toLocaleString('default', {day: '2-digit'});
  
    return [year, month, day].join('-');
}
const formatYMDHIS = (date) => {
    const year = date.toLocaleString('default', {year: 'numeric'});
    const month = date.toLocaleString('default', {month: '2-digit'});
    const day = date.toLocaleString('default', {day: '2-digit'});
    const hour = date.getHours() === 0 ? '00' : date.toLocaleString('default', {hour: '2-digit'});
    const minute = date.getMinutes() === 0 ? '00' : date.toLocaleString('default', {minute: '2-digit'});
    const second = date.getSeconds() === 0 ? '00' : date.toLocaleString('default', {second: '2-digit'});
    const d = [year, month, day].join('-');
    const t = [hour, minute, second].join(':');
    return d + ' ' + t;
}

const getToday = (type) => {
    const toDay = new Date();
    if(type === 'date') return formatYMD(toDay);
    else return formatYMDHIS(toDay);
}

module.exports = {
    formatYMD,
    formatYMDHIS,
    getToday,
}