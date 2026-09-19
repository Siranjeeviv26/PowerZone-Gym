require('dotenv').config();
const mongoose=require('mongoose');
(async()=>{
  await mongoose.connect(process.env.MONGO_URI);
  const User=require('./models/User');
  const Payment=require('./models/Payment');
  const users=await User.find({'membership.status':'active'});
  let fixed=0;
  for(const u of users){
    let need=false;
    const m=u.membership;
    if(!m) continue;
    // Derive package if missing and we have dates
    if(!m.package && m.startDate && m.endDate){
      const s=new Date(m.startDate), e=new Date(m.endDate);
      const months=(e.getFullYear()-s.getFullYear())*12+(e.getMonth()-s.getMonth());
      const map={1:'monthly',3:'quarterly',6:'half-yearly',12:'annual'};
      if(map[months]){ m.package=map[months]; need=true; }
    }
    // Try from latest successful payment if still missing
    if(!m.package){
      const p=await Payment.findOne({user:u._id, status:'success'}).sort({createdAt:-1});
      if(p?.billingCycle){
        const pkgMap={monthly:'monthly', quarterly:'quarterly','half-yearly':'half-yearly', yearly:'annual'};
        const pkg=pkgMap[p.billingCycle];
        if(pkg){ m.package=pkg; need=true; }
        if(p.endDate && !m.nextPaymentDate) { m.nextPaymentDate=p.endDate; need=true; }
        if(p.endDate && !m.endDate) { m.endDate=p.endDate; need=true; }
        if(p.startDate && !m.startDate) { m.startDate=p.startDate; need=true; }
      }
    }
    if(!m.nextPaymentDate && m.endDate){ m.nextPaymentDate=m.endDate; need=true; }
    if(need){ await u.save(); fixed++; console.log(`fixed ${u.email} -> package=${m.package} nextPayment=${m.nextPaymentDate}`); }
  }
  console.log(`Done, fixed ${fixed} users`);
  process.exit(0);
})();
