require('dotenv').config();
const m=require('mongoose');
m.connect(process.env.MONGO_URI).then(async()=>{
  const User=require('./models/User');
  const Payment=require('./models/Payment');
  const MembershipPlan=require('./models/MembershipPlan');
  const elitePlan=await MembershipPlan.findOne({name:'Elite'});
  console.log('elitePlan', elitePlan?._id);
  const eliteUser=await User.findOne({'membership.plan': elitePlan?._id}).populate('membership.plan').populate('branch');
  console.log('eliteUser', JSON.stringify({name:eliteUser?.name, email:eliteUser?.email, membership:eliteUser?.membership, branch:eliteUser?.branch, personalTrainer:eliteUser?.personalTrainer, classTrainer:eliteUser?.classTrainer}, null, 2));
  if(eliteUser){
    const p=await Payment.find({user:eliteUser._id}).sort({createdAt:-1}).limit(3);
    console.log('payments', JSON.stringify(p.map(x=>({billingCycle:x.billingCycle, status:x.status, startDate:x.startDate, endDate:x.endDate, amount:x.amount, billingCycle2:x.billingCycle})), null, 2));
  }
  const recent=await User.find({}).sort({updatedAt:-1}).limit(3).select('name email membership');
  console.log('recent memberships', JSON.stringify(recent, null, 2));
  process.exit(0);
});
