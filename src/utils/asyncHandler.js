
const asyncHandler = (requestHandeler) => {
    (req,res,next) => {
        Promise.resolve(requestHandeler(req,res,next)).catch((err) => next(err))
    }
}


export default asyncHandler





// const asyncHandler = (fn) => aync (req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         req.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }