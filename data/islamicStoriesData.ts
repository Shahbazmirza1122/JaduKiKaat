export interface ProphetStory {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  title: string;
  era?: string;
  summary: string;
  content: string;
  keyLessons: string[];
  imageUrl: string;
  order: number;
}

// Qisas-ul-Anbiya — Stories of the Prophets.
// Original summaries written for this site, based on the shared religious
// tradition recognized across Islamic scholarship — not copied or closely
// paraphrased from any single published book or translation.
export const islamicStories: ProphetStory[] = [
  {
    id: 'story-adam',
    slug: 'adam',
    name: 'Adam',
    arabicName: 'آدم',
    title: 'The First Human and the First Prophet',
    era: 'The Beginning of Mankind',
    summary: 'The creation of the first human being, his place of honor among creation, and the first lesson in repentance.',
    content: `Adam was formed by Allah from clay and given a shape unlike anything that had existed before. When his soul was breathed into him, the angels were commanded to bow before him — not in worship, but in recognition of the honor Allah had placed upon this new creation. All of them obeyed except Iblis, who let arrogance over his own origin of fire blind him to the order, and so he was cast out, swearing to mislead Adam's children for as long as the world lasted.

Adam was given a companion, Hawwa (Eve), and the two of them were settled in a garden of ease where nearly everything was permitted to them except a single tree. It was through that one tree that Iblis found his opening, whispering doubts until Adam and Hawwa ate from it and realized, with regret, what they had done.

What follows is the heart of the story: Adam did not argue or make excuses. He turned to Allah with words of sincere remorse, asking forgiveness for the mistake. That repentance was accepted, and Adam and Hawwa were sent down to the earth — not abandoned, but entrusted with it, as the first generation of a human line that would inhabit it, cultivate it, and be tested within it.

Adam's life afterward was one of guidance: he taught his children, grieved deeply when one son killed another out of envy, and lived to see his descendants spread. His story sets the pattern for every prophet who follows — a human being chosen to carry a message, capable of error, and restored through honest return to Allah.`,
    keyLessons: [
      'Dignity comes from Allah\'s honor upon humanity, not from outward origin or status.',
      'A sincere, specific admission of wrong and a turn back to Allah can undo even a grave mistake.',
      'Arrogance, not the capacity for error, is what truly corrupts — Iblis fell through pride, not a mistake.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=900&auto=format&fit=crop',
    order: 1,
  },
  {
    id: 'story-nuh',
    slug: 'nuh',
    name: 'Nuh (Noah)',
    arabicName: 'نوح',
    title: 'The Patient Caller and the Great Flood',
    era: 'Early Generations',
    summary: 'A prophet who called his people to abandon idols for nearly a thousand years, and the ark that saved those who believed.',
    content: `Nuh was sent to a people who had drifted into worshipping idols named after righteous men of earlier generations, statues they had begun honoring out of love and ended up bowing to as gods. Nuh spent the better part of his life inviting them back to the worship of the One who created them — calling privately, publicly, gently, and firmly, by his own account trying every approach he could think of.

Generation after generation rejected him. Some mocked him, some threatened him, and the wealthy among them dismissed his followers as the poor and the powerless, as if faith required status to be credible. Still Nuh persisted, and still only a small number of people believed.

When Allah informed him that no more of his people would come to faith, Nuh was commanded to build a vessel — on dry land, far from any sea, to the ridicule of everyone who passed by. He built it anyway. When the command came, water rose from the ground and poured from the sky at once, and the ark carried Nuh, his family (apart from a son who refused to board), and a pair of every kind of creature to safety, while the flood swept away a civilization that had refused, for centuries, to listen.

When the waters receded and the ark settled, Nuh emerged to start again, and his account was honored as a record of extraordinary patience in the Qur'an itself.`,
    keyLessons: [
      'Calling others to truth may take a lifetime of patience without visible results — the effort itself is not wasted.',
      'Numbers and wealth are not evidence of being right; truth does not depend on popularity.',
      'Obedience sometimes looks foolish to onlookers before its wisdom is shown.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=900&auto=format&fit=crop',
    order: 2,
  },
  {
    id: 'story-hud',
    slug: 'hud',
    name: 'Hud',
    arabicName: 'هود',
    title: 'The Warner of the People of \'Ad',
    era: 'Ancient Arabia',
    summary: 'A prophet sent to a powerful, tall-statured nation renowned for its architecture, who were destroyed by a devastating wind after rejecting him.',
    content: `The people of 'Ad were famed for their strength and their skill in building — they raised great structures on high ground, as if to boast of their permanence, and took pride in their physical power. Hud, one of their own, was sent to remind them that all of it was a trust from Allah and that worshipping stone idols alongside Him would not protect any of it.

Hud's people answered with mockery, accusing him of foolishness and daring him to bring whatever punishment he was warning them about, so sure were they of their own strength. Hud warned them plainly that arguing about it would not change what was coming, and that his only reliance was on Allah, not on them.

The sign arrived as a dark cloud on the horizon that the people at first welcomed, believing it meant rain after a drought. Instead it was a violent wind that Allah let loose upon them for several relentless days, uprooting everything built by hands that had once seemed unshakeable. Hud and the believers with him were kept safe and left the land afterward, while the ruins of 'Ad became a byword for strength that could not save anyone from accountability.`,
    keyLessons: [
      'Physical strength and impressive achievement offer no protection without accountability to Allah.',
      'Mockery of a warning is not evidence against it — it often precedes the very thing being warned about.',
      'True reliance (tawakkul) means trusting Allah even while standing entirely alone against a crowd.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=900&auto=format&fit=crop',
    order: 3,
  },
  {
    id: 'story-salih',
    slug: 'salih',
    name: 'Salih',
    arabicName: 'صالح',
    title: 'The She-Camel and the People of Thamud',
    era: 'Ancient Arabia',
    summary: 'A prophet given a miraculous she-camel as a sign for his people, who chose to kill it rather than believe.',
    content: `The Thamud carved their homes directly into mountains and cliffs, master craftsmen secure behind walls of solid rock. Salih, raised among them and trusted before his message began, called them to give up the idols they had inherited from their forefathers and worship Allah alone.

When they demanded proof, Salih was given a sign unlike anything they could fabricate: a she-camel that emerged from solid rock at Allah's command. It was no ordinary animal — the people were told to let her drink from the well on her appointed day without harming her, and in turn she produced enough milk to meet their needs, while the rest of the time the well was theirs.

For a while the arrangement held, until a handful of men, irritated by the restriction and egged on by a woman of standing in the tribe, plotted to kill the camel out of sheer defiance. Salih warned them immediately that they had three days left before a punishment would come, and that nothing could reverse it once that window closed. They spent those three days as they had spent the rest, mocking rather than repenting, until a tremendous blast overtook them in their sleep and left Thamud as empty stone dwellings — remarkably preserved, yet utterly lifeless.`,
    keyLessons: [
      'A clear sign from Allah does not guarantee belief if the heart is set on defiance.',
      'A small act of open disobedience, committed deliberately, can seal a much larger fate.',
      'Allah sometimes grants exactly the proof people ask for — the responsibility that follows is real.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=900&auto=format&fit=crop',
    order: 4,
  },
  {
    id: 'story-ibrahim',
    slug: 'ibrahim',
    name: 'Ibrahim (Abraham)',
    arabicName: 'إبراهيم',
    title: 'The Friend of Allah Who Questioned Idols',
    era: 'Mesopotamia',
    summary: 'The father of monotheism among the later prophets, who broke the idols of his people, survived a fire, and built the Ka\'bah.',
    content: `Ibrahim grew up in a household that carved and sold idols, yet from a young age he questioned how anything made by human hands could deserve worship. Scripture describes him reasoning aloud about the sun, moon, and stars, admiring each only to watch it set, until he concluded that true worship belonged only to the One who does not fade — the Creator of them all.

Confronting his own father and his people directly, Ibrahim eventually took an axe to their idols, leaving only the largest one intact and the axe resting on its shoulder — so that when the people returned to a scene of destruction, he could ask them pointedly why they didn't question the very idol they still trusted. Furious and unable to answer him, his people had a great fire built and threw him into it. Ibrahim entered the flames having placed his whole trust in Allah, and the fire was made, by Allah's command, to bring him no harm at all.

Later in life Ibrahim traveled with his wife Hajar and infant son Isma'il to a barren valley in Arabia, leaving them there on Allah's instruction and trusting that provision would come — which it did, in the miraculous spring of Zamzam. Father and son would later stand together to raise the foundations of the Ka'bah, the house of worship that Muslims still turn toward in prayer today. Ibrahim's unwavering willingness to obey, even when tested with the near-sacrifice of his son, earned him the title "Khalil" — the close friend of Allah.`,
    keyLessons: [
      'Genuine faith is reached through sincere reflection, not merely inherited from one\'s family or culture.',
      'Trusting Allah\'s protection does not require the danger to disappear first — it requires stepping into it.',
      'Obedience that costs something — comfort, family ties, even a beloved son — is the obedience that is remembered.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=900&auto=format&fit=crop',
    order: 5,
  },
  {
    id: 'story-ismail',
    slug: 'ismail',
    name: "Isma'il (Ishmael)",
    arabicName: 'إسماعيل',
    title: 'The Son Left in the Desert Valley',
    era: 'Ancient Arabia',
    summary: 'The son of Ibrahim whose infancy in a barren valley brought forth the well of Zamzam, and whose obedience as a young man mirrored his father\'s.',
    content: `As an infant, Isma'il was left with his mother Hajar in a valley with no water and no visible means of survival, on Allah's instruction to Ibrahim. When their small supply of water ran out, Hajar searched desperately between two nearby hills, running back and forth seven times looking for any sign of help — a search still commemorated by pilgrims during Hajj today.

It was then that water sprang up miraculously beneath the infant Isma'il's feet, a spring that came to be called Zamzam and has not stopped flowing since. Travelers and tribes settled near the water over time, and the empty valley grew into what would become Makkah.

As Isma'il grew older, Ibrahim was tested with a vision instructing him to sacrifice his son. Rather than resist, Isma'il — upon hearing of it from his father — responded that he should go ahead and carry out what he had been commanded, and that he would be found patient, God willing. As the two of them submitted to the command, Allah intervened at the final moment, replacing the sacrifice with a ram and establishing a trial that Islamic tradition commemorates every year during Eid al-Adha.

Isma'il later helped his father raise the walls of the Ka'bah and is remembered as the patriarch of a lineage that would, generations later, include the final Prophet, Muhammad ﷺ.`,
    keyLessons: [
      'Provision can arrive in the most unlikely circumstances when reliance on Allah is complete.',
      'Willing submission, even from a child to a difficult command, is itself an act of deep faith.',
      'Small acts of desperate searching, like Hajar\'s, can be honored by Allah for generations afterward.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=900&auto=format&fit=crop',
    order: 6,
  },
  {
    id: 'story-ishaq',
    slug: 'ishaq',
    name: 'Ishaq (Isaac)',
    arabicName: 'إسحاق',
    title: 'The Promised Son of Old Age',
    era: 'Ancient Levant',
    summary: 'The second son of Ibrahim, born in his parents\' old age as glad tidings, and a prophet in his own right who continued his father\'s mission.',
    content: `Ishaq was born to Ibrahim and his wife Sarah long after they had given up any expectation of having a child together, a birth announced to them by angels who had stopped at their home on the way to deliver a warning to the people of Lut. Sarah's astonishment at the news — and the angels' gentle reminder that nothing is difficult for Allah — is recorded as one of the clear signs of her son's unusual, blessed beginning.

Ishaq grew up continuing his father's mission of calling people to the worship of Allah alone, settling in the land of Canaan and raising a family that carried the prophetic line forward. His son Ya'qub would inherit both his father's and grandfather's task, and through Ya'qub's own twelve sons the Israelite nation would descend — a lineage through which many later prophets, including Musa and Isa, would come.

Though less is narrated of Ishaq's own trials compared to his father's, he is honored in the Qur'an alongside Ibrahim and Ya'qub as a man of strength in worship and clear insight, a link in an unbroken chain of prophets who each, in their own time and place, delivered the same essential message.`,
    keyLessons: [
      'Allah\'s promises can arrive at the point that seems most impossible by ordinary human expectation.',
      'A righteous legacy is often carried forward quietly, through children raised to continue the mission.',
      'Every generation of a prophetic family still had to earn its own closeness to Allah through worship.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=900&auto=format&fit=crop',
    order: 7,
  },
  {
    id: 'story-lut',
    slug: 'lut',
    name: 'Lut (Lot)',
    arabicName: 'لوط',
    title: 'The Warner of a City Steeped in Wrongdoing',
    era: 'The Cities of the Plain',
    summary: 'A nephew of Ibrahim sent to call his adopted city away from open wrongdoing unprecedented among nations, before it was overturned.',
    content: `Lut lived among a people who had normalized a form of open transgression that, the Qur'an notes, no community before them had practiced so openly. He pleaded with them directly, appealing to decency and offering alternatives, but was met only with threats to expel him and his family from the city for daring to object.

When angels arrived in the form of guests to warn Lut of the city's coming destruction, his people's reaction confirmed exactly why judgment had been decreed, rushing toward his house with hostile intent toward his visitors. The angels revealed their true nature to protect him and instructed Lut to leave with his family under cover of night, with a single explicit warning: no one was to look back.

Lut's wife, who had sided with her people rather than with him, stayed behind in spirit even as she left in body, and turned to look — sharing in the fate of the city rather than escaping it. In the morning, the cities were turned over and struck with a rain of stones, erased from the land as an unmistakable sign for anyone who would reflect on it afterward.`,
    keyLessons: [
      'Standing against widely accepted wrongdoing, even when isolated, is the role a believer may be called to.',
      'Family ties do not override the consequence of choosing to side with wrong over right.',
      'A clear, simple instruction from Allah — like not looking back — deserves complete, literal obedience.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=900&auto=format&fit=crop',
    order: 8,
  },
  {
    id: 'story-yaqub',
    slug: 'yaqub',
    name: "Ya'qub (Jacob)",
    arabicName: 'يعقوب',
    title: 'The Father Who Waited in Patience',
    era: 'Ancient Levant',
    summary: 'The son of Ishaq and father of twelve sons, whose decades of grief over his missing son Yusuf became a model of patient faith.',
    content: `Ya'qub is remembered above all through his bond with his son Yusuf, whom he loved with a visible tenderness that stirred envy among Yusuf's older brothers. When those brothers returned one evening claiming a wolf had devoured Yusuf, producing his shirt stained with blood but strangely untorn, Ya'qub saw through the story immediately, yet he chose composed patience over confrontation he could not win, saying that beautiful patience was his only recourse and that his reliance was on Allah against what they described.

Ya'qub's grief did not fade with time. Years later, his eyes are described as having turned white from constant weeping for a son he never stopped believing was alive somewhere, even as his other sons grew impatient with him for holding on to what looked like impossible hope. Still, he never spoke of despair — only of taking his sorrow to Allah, since he knew, in his own words, things from Allah that his sons did not.

When news finally came that Yusuf was alive and had risen to high standing in Egypt, Ya'qub's patience was answered in full: a reunion with the son he had mourned for decades, and the restoration of his eyesight upon catching Yusuf's scent on a shirt sent ahead of him.`,
    keyLessons: [
      'Grief and patience are not opposites — a believer can hold deep sorrow while still choosing not to despair.',
      'Holding on to hope in Allah, even against everyone else\'s doubt, is not foolishness but faith.',
      'Long-delayed answers do not mean a prayer was ignored.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop',
    order: 9,
  },
  {
    id: 'story-yusuf',
    slug: 'yusuf',
    name: 'Yusuf (Joseph)',
    arabicName: 'يوسف',
    title: 'From the Bottom of a Well to the Treasuries of Egypt',
    era: 'Ancient Egypt',
    summary: 'Betrayed by his own brothers and sold into slavery, Yusuf rose through integrity and patience to a position of great authority in Egypt.',
    content: `As a boy, Yusuf described a dream of eleven stars, the sun, and the moon all prostrating before him. His father Ya'qub, sensing the dream's significance, warned him gently not to share it with his brothers, whose jealousy over their father's visible love for Yusuf was already simmering. That jealousy eventually led the brothers to throw Yusuf into the bottom of a well, left to be picked up by a passing caravan and sold into slavery in Egypt.

In Egypt, Yusuf was raised in the household of a nobleman, where the nobleman's wife attempted to seduce him; Yusuf's refusal, rooted entirely in his awareness of Allah, led to false accusations and years of imprisonment despite his innocence being evident to those around him. In prison, his skill at interpreting dreams for fellow inmates eventually reached the king himself, who needed his own troubling dream explained. Yusuf's interpretation — warning of seven years of abundance followed by seven years of famine — impressed the king enough that Yusuf was placed in charge of Egypt's granaries and provisions.

Years later, famine brought his own brothers to Egypt seeking grain, unknowingly standing before the very brother they had betrayed. Yusuf eventually revealed himself, forgave them outright, and arranged for his aging father and entire family to join him in Egypt — closing a story that began at the bottom of a well with a reunion none of them had thought possible.`,
    keyLessons: [
      'Integrity under pressure, even when it costs years of unjust imprisonment, is never wasted before Allah.',
      'Jealousy within a family can cause real harm, but it does not have the final word.',
      'Genuine forgiveness toward those who wronged you is possible once a trial has passed and the heart has healed.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=900&auto=format&fit=crop',
    order: 10,
  },
  {
    id: 'story-ayyub',
    slug: 'ayyub',
    name: 'Ayyub (Job)',
    arabicName: 'أيوب',
    title: 'Patience Through Illness and Loss',
    era: 'Ancient Arabia',
    summary: 'A prophet who lost his wealth, his children, and his health in succession, yet never once complained against Allah, becoming the symbol of patience itself.',
    content: `Ayyub had been given abundant wealth, a large family, and good health, all of which he used generously and gratefully. His trial came in stages: his herds and property were lost, then his children, and eventually a prolonged illness took his health as well, leaving him in a condition severe enough that most people around him, apart from his devoted wife, distanced themselves from him.

Through all of it, Ayyub's complaint — when he finally voiced one — was remarkably restrained: he simply noted to Allah that hardship had touched him and that Allah was the Most Merciful of the merciful, asking for relief without a single word of resentment or blame. He did not treat the loss of blessings as grounds to doubt Allah's wisdom, continuing his worship and gratitude even while his body failed him.

In response, Allah instructed Ayyub to strike the ground, and a spring burst forth in which he bathed and drank, his health restored. His family was given back to him, doubled in Allah's mercy, and his wealth returned in abundance. Ayyub's name became permanently tied to the Arabic word for patience — sabr — not the patience of simply waiting, but the patience of not letting hardship shake one's trust in Allah.`,
    keyLessons: [
      'True patience is measured by what is said and felt during hardship, not only by outward endurance.',
      'Loss of wealth, health, or family does not mean loss of Allah\'s care — trials and love are not opposites.',
      'It is permitted, and even natural, to ask Allah for relief — patience does not mean pretending not to suffer.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=900&auto=format&fit=crop',
    order: 11,
  },
  {
    id: 'story-musa',
    slug: 'musa',
    name: 'Musa (Moses)',
    arabicName: 'موسى',
    title: 'The Prophet Who Confronted a Pharaoh',
    era: 'Ancient Egypt',
    summary: 'Raised in Pharaoh\'s own palace after being set adrift as an infant, Musa returned decades later to demand the freedom of his enslaved people.',
    content: `To escape a decree that newborn boys among the Israelites be killed, Musa's mother was divinely inspired to place her infant son in a basket on the river, trusting Allah entirely with his fate. The basket was found and brought into Pharaoh's own household, where Musa was raised, unknowingly, in the home of the very tyrant his people lived in fear of.

As a young man, after accidentally killing an Egyptian in a confrontation, Musa fled to Madyan, where he spent years working and started a family, before Allah called him to prophethood at a burning bush on his journey back. The command was direct: return to Pharaoh, who had since declared himself a god, and demand the release of the Israelites from generations of enslavement.

Musa's confrontations with Pharaoh unfolded over repeated warnings, miraculous signs — his staff turning into a serpent, his hand glowing with light — and a court of magicians who, upon witnessing the truth of his sign, fell into prostration themselves despite Pharaoh's fury. When Pharaoh finally let the Israelites leave and then pursued them with his army, Musa led his people directly toward the sea, which Allah split into a dry path at the last possible moment, before closing it again over Pharaoh's pursuing forces.

Musa's remaining years were spent guiding a people who, freed from slavery, still struggled with faith and obedience, receiving the Torah and establishing the foundations of law and worship they would build upon for generations.`,
    keyLessons: [
      'Allah\'s plan can place someone exactly where they are needed, even inside the household of their eventual opponent.',
      'Confronting injustice directly, even from a position of apparent weakness, is a prophetic example worth following.',
      'Freedom from oppression does not instantly produce strong faith — guidance afterward is its own long task.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=900&auto=format&fit=crop',
    order: 12,
  },
  {
    id: 'story-harun',
    slug: 'harun',
    name: "Harun (Aaron)",
    arabicName: 'هارون',
    title: 'The Eloquent Brother and Steadfast Support',
    era: 'Ancient Egypt',
    summary: 'Musa\'s older brother, granted prophethood alongside him as a support in both speech and leadership through the confrontation with Pharaoh.',
    content: `When Musa was called to confront Pharaoh, he asked Allah directly for his brother Harun to be sent with him, describing Harun as more fluent in speech and asking that his own burden be eased through a partner who could help convey the message clearly and firmly. The request was granted, and the two brothers approached Pharaoh's court together, sharing the responsibility of a mission neither could easily carry alone.

Harun's steadiness was tested sharply while Musa was away receiving guidance: left in charge of the Israelites, Harun watched as many of them fell into worshipping a golden calf crafted by one of their own. He warned them urgently against it, reminding them that their true Lord was Allah, yet a portion of the people ignored him outright, more impressed by a craftsman's idol than by their own prophet's warning. When Musa returned, furious at what had happened, Harun explained that he had feared division among the people if he acted too forcefully in Musa's absence, and Musa accepted his brother's explanation.

Harun's role throughout is one of quiet, consistent support — not seeking the spotlight of leadership for himself, but standing firmly beside a brother carrying an enormous task, and holding his post as faithfully as he could even when the outcome was out of his hands.`,
    keyLessons: [
      'Supporting a cause does not always mean being the most visible figure in it.',
      'Leadership sometimes means making a difficult judgment call about preventing worse division, even if it looks imperfect afterward.',
      'Asking Allah for help and for the right people around you is itself part of fulfilling a difficult task.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop',
    order: 13,
  },
  {
    id: 'story-dawud',
    slug: 'dawud',
    name: 'Dawud (David)',
    arabicName: 'داود',
    title: 'The Shepherd Who Became a Just King',
    era: 'Ancient Israel',
    summary: 'A young shepherd who defeated a feared warrior in single combat and rose to be a prophet-king known for justice, worship, and a beautiful voice.',
    content: `Dawud first appears in the Qur'anic narrative as a young man in the army facing Jalut (Goliath), a warrior so feared that none of the seasoned soldiers would face him. Dawud stepped forward instead, and with little more than a sling, struck Jalut down — a victory that reshaped how his people saw him and set him on a path toward kingship.

As king, Dawud was given both worldly authority and prophethood together, along with the Zabur (Psalms) and a voice so moving in recitation that birds and mountains are described as joining him in glorifying Allah. He was also given remarkable skill in craftsmanship, including the forging of flexible armor, and he is held up in the Qur'an as a model of combining strength with humility — a ruler who did not let power distance him from worship or from accessible justice for his people.

A particular episode highlights his approach to judgment: two men came to him in dispute, and rather than ruling hastily, Dawud listened carefully to both sides before issuing his decision, later turning to Allah in repentance over a concern that he may have judged too quickly. That reflex of self-examination, even as a reigning king, is central to why he is remembered as a just and humble leader rather than merely a powerful one.`,
    keyLessons: [
      'Courage can come from conviction rather than size or reputation — Dawud faced Jalut when seasoned soldiers would not.',
      'Worldly power and sincere worship are not in conflict; Dawud held both without one diminishing the other.',
      'A good leader keeps examining their own judgments rather than assuming authority makes them beyond error.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=900&auto=format&fit=crop',
    order: 14,
  },
  {
    id: 'story-sulaiman',
    slug: 'sulaiman',
    name: "Sulaiman (Solomon)",
    arabicName: 'سليمان',
    title: 'The King Who Spoke With the Natural World',
    era: 'Ancient Israel',
    summary: 'Dawud\'s son, granted an unmatched kingdom and the ability to understand animals and command the wind and jinn, who used it all in humble gratitude.',
    content: `Sulaiman inherited his father Dawud's prophethood and kingship, and asked Allah for a dominion unlike any granted to anyone after him — a request granted alongside gifts that set his reign apart entirely: the wind moved at his command, the jinn worked under his authority on construction and craft, and he was given the ability to understand the speech of animals and birds.

One well-known episode involves an ant, from a colony in his army's path, warning the other ants to take shelter so Sulaiman's forces would not trample them without even realizing it — a remark Sulaiman overheard and smiled at, thanking Allah for the awareness it gave him of how carefully he needed to tread, literally and otherwise, through the world. Another involves the hoopoe bird bringing him news of the Queen of Sheba's kingdom, which led to an exchange of letters and eventually her acceptance of Sulaiman's call to worship Allah alone, after witnessing wonders in his court that she could not otherwise explain.

Despite ruling over wealth, armies, and forces of nature that no king before or since has commanded, Sulaiman's own words reflect constant gratitude rather than pride, recognizing every gift as a test of whether he would remain thankful or grow heedless. His story stands as a reminder that immense power, handled with humility, can be a means of drawing people toward truth rather than away from it.`,
    keyLessons: [
      'Extraordinary blessings are tests of gratitude, not simply rewards to be enjoyed without reflection.',
      'Even enormous power should be used carefully enough to notice the smallest creatures in its path.',
      'Calling others to truth can be done through wisdom and evidence, not only through confrontation.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=900&auto=format&fit=crop',
    order: 15,
  },
  {
    id: 'story-yunus',
    slug: 'yunus',
    name: 'Yunus (Jonah)',
    arabicName: 'يونس',
    title: 'The Prophet in the Belly of the Whale',
    era: 'Ancient Nineveh',
    summary: 'A prophet who left his people in frustration before they repented, and found himself swallowed by a great fish after being cast into the sea.',
    content: `Yunus was sent to the people of Nineveh, who rejected his message for a long stretch of time. Frustrated by their refusal and without waiting for Allah's permission to leave, Yunus departed the city, eventually boarding a ship that ran into such severe trouble at sea that the crew, in desperation, decided to cast lots to determine who should be thrown overboard to lighten the vessel. Yunus's name came up, not once but repeatedly, and he was cast into the sea.

A great fish swallowed him whole, and it was there, in what the Qur'an describes as layers of darkness — the darkness of the sea, the night, and the fish's belly combined — that Yunus turned to Allah with a supplication that remains among the most recited in Islamic tradition: a declaration that there is no god but Allah, glorifying Him, and acknowledging that he himself had been among the wrongdoers for leaving without permission.

Allah accepted his repentance and had the fish release him onto a barren shore, weak and unwell, where a gourd vine was made to grow over him for shade as he recovered. He was then sent back to his people — who, remarkably, had turned to sincere repentance in his absence, becoming one of the rare communities in the Qur'an whose collective repentance was accepted and whose punishment was lifted entirely.`,
    keyLessons: [
      'Even a prophet\'s moment of frustration carries real consequences — leaving a duty without permission has a cost.',
      'No darkness is too deep for a sincere call to Allah to be heard.',
      'Mercy can reach a people even after a prophet has given up hope in them — judgment belongs to Allah, not to our own patience limits.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=900&auto=format&fit=crop',
    order: 16,
  },
  {
    id: 'story-isa',
    slug: 'isa',
    name: 'Isa (Jesus)',
    arabicName: 'عيسى',
    title: 'The Miraculous Birth and the Messenger to the Israelites',
    era: 'Roman Palestine',
    summary: 'Born miraculously to Maryam without a father, Isa was granted prophethood from the cradle and sent with signs, healing, and a message of pure monotheism.',
    content: `Maryam, a woman of exceptional devotion raised in the care of the Temple, withdrew to a secluded place when an angel came to her with the news that she would bear a son, despite having had no contact with any man. Isa's birth was itself a sign to the world, and when she returned to her people carrying the infant, facing their shock and accusation, Isa spoke from the cradle, declaring himself a servant of Allah given the scripture and appointed a prophet — silencing the accusations against his mother immediately.

As an adult, Isa was supported with extraordinary signs: healing the blind and the leper, and, by Allah's permission alone, bringing the dead back to life, miracles he consistently attributed entirely to Allah rather than to himself. His message to the Israelites called them back to the pure worship of the One God and confirmed the Torah that had come before him, while also easing some of the restrictions that had been placed on earlier generations.

Rejected and plotted against by those in power, Isa was, according to Islamic belief, not killed nor crucified, but raised up to Allah, with the plot against him made to appear successful to his enemies when it was not. Islamic tradition holds that he remains alive and will return in the future — a belief that places Isa among the most honored of prophets, second only to Muhammad ﷺ in the frequency with which he is mentioned across the Qur'an's prophetic accounts.`,
    keyLessons: [
      'Allah\'s power is not bound by ordinary biological process — a fatherless birth or a speaking infant are both within His capability.',
      'A prophet\'s miracles are a sign pointing to Allah, never a claim to divinity of their own.',
      'Apparent defeat at the hands of powerful opponents is not the same as actual defeat in Allah\'s plan.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?q=80&w=900&auto=format&fit=crop',
    order: 17,
  },
  {
    id: 'story-muhammad',
    slug: 'muhammad',
    name: 'Muhammad ﷺ',
    arabicName: 'محمد ﷺ',
    title: 'The Seal of the Prophets',
    era: 'Makkah and Madinah',
    summary: 'Orphaned young and known even before his prophethood for his honesty, Muhammad ﷺ received the final revelation and completed the message carried by every prophet before him.',
    content: `Muhammad ﷺ was born in Makkah, losing his father before birth and his mother as a young child, raised first by his grandfather and then his uncle. Long before any revelation came to him, he was known across his city simply as "the Trustworthy" — a reputation for honesty so solid that even his fiercest later opponents continued entrusting him with their valuables.

At the age of forty, while in retreat in a cave outside Makkah, he received the first revelation through the angel Jibril, beginning a mission that would span twenty-three years. His early message — inviting his people back to the worship of the One God their own ancestor Ibrahim had called to — was met with ridicule, boycott, and violent persecution directed at him and his small number of followers, many of whom endured severe hardship rather than renounce their faith.

After years of pressure in Makkah, he migrated to Madinah, an event that marks the start of the Islamic calendar, where a fragmented city united under his leadership into a functioning community with agreed laws, treaties, and mutual protections between its different tribes and faiths. Over the following years, through both diplomacy and defensive conflict, the message spread across Arabia, and he returned to Makkah not in vengeance but in remarkable clemency, forgiving even those who had fought him for years.

His final sermon emphasized the equality of all people regardless of race or lineage, the sanctity of life and property, and the completion of the faith he had been sent to deliver. Muslims hold him as the final prophet, sent to confirm and complete the same essential message carried by every prophet before him, from Adam onward.`,
    keyLessons: [
      'Character and trustworthiness built over a lifetime speak louder than any claim made afterward.',
      'Perseverance through persecution, without abandoning either the message or its principles, is itself a form of worship.',
      'Victory achieved with forgiveness rather than vengeance leaves the deeper, more lasting impression.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop',
    order: 18,
  },
];

export const getStoryBySlug = (slug: string): ProphetStory | undefined =>
  islamicStories.find((s) => s.slug === slug);

export const getAdjacentStories = (order: number) => {
  const sorted = [...islamicStories].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((s) => s.order === order);
  return {
    previous: idx > 0 ? sorted[idx - 1] : undefined,
    next: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined,
  };
};
