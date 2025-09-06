import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const LockModule = buildModule("MK", (m) => {

  const mk = m.contract('MK', [5])

  return { mk };
});

export default LockModule;
