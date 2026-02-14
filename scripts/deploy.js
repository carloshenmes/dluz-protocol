const hre=require("hardhat");
const fs=require("fs");
const path=require("path");

async function main(){
  const[deployer]=await hre.ethers.getSigners();
  const balance=await hre.ethers.provider.getBalance(deployer.address);
  console.log("dLuz Protocol - Full Deployment");
  console.log("Network:",hre.network.name);
  console.log("Deployer:",deployer.address);
  console.log("Balance:",hre.ethers.formatEther(balance),"ETH");

  var F,c;
  F=await hre.ethers.getContractFactory("DLuzToken");
  c=await F.deploy(deployer.address);await c.waitForDeployment();
  var dluz=await c.getAddress();console.log("DLuzToken:",dluz);

  F=await hre.ethers.getContractFactory("DCarbonToken");
  c=await F.deploy();await c.waitForDeployment();
  var dcarbon=await c.getAddress();console.log("DCarbonToken:",dcarbon);

  F=await hre.ethers.getContractFactory("DEnergyToken");
  c=await F.deploy();await c.waitForDeployment();
  var denergy=await c.getAddress();console.log("DEnergyToken:",denergy);

  F=await hre.ethers.getContractFactory("CarbonRegistry");
  c=await F.deploy(dcarbon);await c.waitForDeployment();
  var registry=await c.getAddress();console.log("CarbonRegistry:",registry);

  var dep={network:hre.network.name,chainId:hre.network.config.chainId,deployer:deployer.address,timestamp:new Date().toISOString(),contracts:{DLuzToken:dluz,DCarbonToken:dcarbon,DEnergyToken:denergy,CarbonRegistry:registry}};
  var dir=path.join(__dirname,"..","deployments");
  if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,hre.network.name+".json"),JSON.stringify(dep,null,2));
  console.log("Saved: deployments/"+hre.network.name+".json");

  if(hre.network.name!=="hardhat"&&hre.network.name!=="localhost"){
    console.log("Waiting 30s...");await new Promise(function(r){setTimeout(r,30000);});
    var list=[{n:"DLuzToken",a:dluz,c:[deployer.address]},{n:"DCarbonToken",a:dcarbon,c:[]},{n:"DEnergyToken",a:denergy,c:[]},{n:"CarbonRegistry",a:registry,c:[dcarbon]}];
    for(var i=0;i<list.length;i++){try{await hre.run("verify:verify",{address:list[i].a,constructorArguments:list[i].c});console.log(list[i].n+" verified!");}catch(e){console.log(list[i].n+" failed: "+e.message);}}
  }
}
main().then(function(){process.exit(0);}).catch(function(e){console.error(e);process.exit(1);});