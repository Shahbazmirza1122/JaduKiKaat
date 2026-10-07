const fs = require('fs');

const content = fs.readFileSync('pages/Home.tsx', 'utf8');

const servicesStart = content.indexOf('<section id="services"');
const nextSection = content.indexOf('      {/* Collective Prayer Section */}');
if (servicesStart === -1 || nextSection === -1) {
  console.log("Could not find section boundaries");
  process.exit(1);
}

const servicesSection = content.substring(servicesStart, nextSection);

let newContent = content.substring(0, servicesStart) + content.substring(nextSection);

const pillarsStart = newContent.indexOf('      {/* Pillars Section */}');
if (pillarsStart === -1) {
  console.log("Could not find Pillars Section");
  process.exit(1);
}

newContent = newContent.substring(0, pillarsStart) + 
             '      {/* Spiritual Solutions (Services) Section */}\n      ' + 
             servicesSection + 
             newContent.substring(pillarsStart);

fs.writeFileSync('pages/Home.tsx', newContent);
console.log("Moved section successfully");
