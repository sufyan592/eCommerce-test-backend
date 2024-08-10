function resSuccess(message, status, data) {
	return {
		message,
		isSuccess: true,
		status,
		data: data
	};
};

function resError(message, status) {
	return {
		message,
		isSuccess: false,
		status
	};
};


module.exports = { resSuccess, resError }