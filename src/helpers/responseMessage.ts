const Respmsg = function (xcode?: number): string {

  const responses = {
    200: "SUCCESS",
    400: "No Data Found!",
    401: "Unauthorized!",
    404: "Not Found!",
    409: "Request Timeout!",
    463: "The HTTP POST data has lacking required parameters. This would be a good time to double check spelling.",
    500: "Internal Server Error.",
    503: "Service Unavailable.",
    0: "Unable to process request. The system encountered some technical problem.",
    1: "Unable to process request. Please review your data and try again.",
    2: "Unable to process request. Connection timeout occured. Please try again later.",
    3: "Unable to process request. Failed in connecting to server. Please try again later.",
    4: "Incorrect Username Or Password. Please Try Again.",
    5: "System encountered duplicate record. Please remove the duplicated transaction and upload again.",
    6: "Already paid/processs.",
    7: "Request Message sent!",
    8: "Inactive User!",
    9: "Successfully Log-in",
    10: "Successfully Saved",
    11: "Already fulfilled",
    12: "This Account cannot transact load with the same amount within 5 minutes. Please try again later.",
    13: "Unable to Process request. Please check if all wallet number's are registered in KP Mobile.",
    14: "Successfully Cancelled.",
    15: "This Account cannot transact load with the same amount within 5 minutes. Please try again later.",
    16: "Incomplete Parameters Provided.",
    17: "Error",
    18: "System encountered an unregistered wallet number. Please verify this data and upload again:",
    19: "System encountered a wallet number that does not match the supplied firstname/lastname. Please verify your data and upload again.",
    20: "Unable to send notification message.",
    21: "Notification Message sent!",
    22: "Shop name already exists.",
    23: "Email and Password Field Empty!",
    24: "Email Field Required!",
    25: "Password Field Required",
    26: "Wrong Email/Password!",
    27: "Successfully Registered. You're now a Merchant.",
    28: "Done Logging.",
    29: "550 Cannot create a file when that file already exists.",
    30: "Image Successfully Deleted.",
    31: "Successfully Added Image/s"
  }

  return responses[xcode] ? responses[xcode] : responses[200];
};

export default Respmsg;