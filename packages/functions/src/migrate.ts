import fs from 'node:fs'
import { Readable } from 'node:stream'
import csv from 'csv-parser'
import { viaprize } from './utils/viaprize'
const csvString = `id,email,authId,name,username,isAdmin,bio,avatar,proficiencies,priorities,walletAddress
0228db18-36d6-4bff-99b3-2c60e1684f3a,support@viaprize.org,did:privy:clq7grnlw008tl10f0tljt5so,viaPrize,viaprize,false,The home for all your crowdfunding needs,,[],[],0x1f00DD750aD3A6463F174eD7d63ebE1a7a930d0c
029ab785-b49a-4e91-9ef9-b6ab0d5d44b2,boyang@p12.dev,did:privy:clr6rrzru00v4ky0gpucugwjg,boyang,b0yan913,false,Founder @ P12. Brain Computer Interface; Transhumanism; Network State,,[],[],0x98e1AF316aee58814FDb062e0e531e7bdEba5a6C
0f13705b-2f47-483a-a029-39b840dc22bf,cef7@pm.me,did:privy:clzla98mz04pbfiz2ja8pb21d,Charlie Fisher,charlie,false,,,[],[],0x97B59C2EC4Ac59B5A581d028bf495Fd47C96892d
0f20facb-7681-4cce-a12c-e4bebc0c21eb,colton.orr25@gmail.com,did:privy:clukh2feq06618v9lzl830ubb,Colton Orr,colton,false,"Building - http://AceTCG.xyz Artist, storyteller, optimist 🌴☀️ Prev: 
@Gitcoin
, 
@InsomniacGames
 Spider-Man Character Artist",,[],[],0x6B5918D8EF9094679F4b4e1Bf397a66eA411B118
0fd1be5c-5727-48db-9e75-cbb7ce097b5e,coderintherye@gmail.com,did:privy:clyhy02j7040f4g1loduo2eb6,coderintherye,coderintherye,false,,,[],[],0xF91A47823dda189dCBEd6C8eD2b781D587821f33
11554e58-362e-469e-923d-dcdb9a63b7ce,bluelotus363@gmail.com,did:privy:clrj7guc303ajjj0fev3y8ytp,Akash,zkash,false,dev,,[],[],0x7E044abb75D743dc0A823Dad1d3efe5B8418797A
1d5bba74-d2ae-4864-8d19-27098683f8fe,spam.flo@pm.me,did:privy:clrdndwmw0037l40idhpifjc4,flo,flowrider,false,...,,[],[],0x220AbD48f2b444E1a352B6927c885C4579738081
1f4d0337-9194-4af8-8369-db03eb6b38f5,ben@latenightsketches.com,did:privy:clzutwjr500g5ijboydnkfn8l,Ben Green,numtel,false,,,[],[],0xa48c718AE6dE6599c5A46Fd6caBff54Def39473a
219e9439-eed0-41d1-b35f-605bdaed5a1b,tibet@terran.io,did:privy:clzu2fbxi01jvzsy0adeamec1,Tibet Sprague,tibetsprague,false,,,[],[],0x0084FB1d84F2359Cafd00f92B901C121521d6809
23326308-b113-4999-8ad0-8ab796e935ec,aryantiwari7762@gmail.com,did:privy:clpe981au02o7jw0fl34i16bj,Aryan Tiwari,arry,false,Software Developer,https://uofqdqrrquswprylyzby.supabase.co/storage/v1/object/public/campaigns/169IMG3075JPG,"Python,JavaScript","Network Civilizations,Open-Source",0xBAfF9f54b938AFcd07Ef1819B6162F340b80ACA7
24d33f75-ccdc-4bb9-8110-509a73d2efd4,parsan16167@gmail.com,did:privy:cm0htxe4k01kdjskve2iuia62,Back up,backup,false,,,[],[],0x8f43115B07B3cAa2eeE72989E8c206Ec8E10FB92
2955266d-d500-4730-b117-c2efa5d01d99,chengwei2061@gmail.com,did:privy:cluijgh4602t3ezm6109j12wq,Vee Cheng,bonecato,false,,,[],[],0x4f0Dc1c5c57b3a63b23205b43e055bE45F4dc702
2d0c6ab5-a4f6-42c3-98b5-0bb692e6f549,robsheko@gmail.com,did:privy:clsmgekzl00z3iwx7aukzr6qh,Rob Shekoyan,robsheko,false,"Death is bad, life is good",,[],[],0x1Ad10b10083d37ff367a2ade5e40db981A05eB8e
2ebae20d-11e3-4a60-b324-e6ca250dd668,mcmarkse@gmail.com,did:privy:clwmi7pai02mzg84qd7pf4lfu,Mark,mac,false,jacked,,[],[],0x9A7B14053C88928f7d59A6dfFdb745D8e256E654
344af871-a57b-4dd3-a17c-425b90ea613a,project195percent@gmail.com,did:privy:clukhpe7k0465u262i62zglmc,abhinav,project195,false,On a mission to tokenize carbon credits,,[],[],0xB0C3C8c05199FA6c955C65df08025AF76EF211Df
3a8974c4-c98c-477c-9a0c-c9f0de1059d9,luisdv26@gmail.com,did:privy:clrlessmr00ofl80gl9hsgbmv,Luis,luisgonzales,false,Roatan local who loves this project. ,,[],[],0xF9649E032cF877700F09603D00a6b56a5F2F0DEA
3b38f4fa-bc74-4b4d-9362-32b725718a4e,rajswaraj.r+testing@gmail.com,did:privy:cltss1nma00r1kjl140o8mbud,swarajtest,swarajthisistest,true,hey,,"JavaScript,Translation","Climate Change,Community Coordination",0x5F3f374256c0BA5d833184E74A48dD326DB2Dd14
3edf1342-d3c2-4981-8b6d-93745ab4198a,elinorrennie@gmail.com,did:privy:clzm9wiau01at26c6pj1l7nq1,Ellie Rennie,ellie,false,,,[],[],0x6b1bD33e87cf3F06Efd5E76246B4314D32E71a07
3f1572d3-a57e-42e4-8d64-ae05fa5b5691,noahchonlee+test@gmail.com,did:privy:cltsru7qn05hjyo3uf9e2q3xm,Noah But For Tests,testingmyaccount1noah,false,testing this out,,[],[],0x8df49481a368a3E0F3518198eE8E7e7BdfE142EA
467d717c-fa09-4cc9-9da3-60bc6bc39760,Shinafxt2000@gmail.com,did:privy:clq9bt3eo00bcjp0f30jepxq9,Shina,shina,false,-,,[],[],0x54948734849b57eEa9590d092C3df0B2fF0546D6
4e0e190e-3eed-4cbf-85dd-26354e601bc9,yihaotian@gmail.com,did:privy:clut9sab90kxkiijyqekdb3vk,Haotian Yi,pinguis,false,,,[],[],0xE8c8f12cCB61fD25EcC5E391E99f69a971526C99
50c3c638-c690-4780-b1b5-65823d6dc6bc,dev@gmail.com,did:privy:clrdnhsju032sib0f4jkslwjg,Dev Test,dev,true,asdfjkl;,,[],[],0x598B7Cd048e97E1796784d92D06910F359dA5913
53fb310a-3ce1-499f-b7e6-bd79756f9bf9,xyz@yahoo.com,did:privy:clruimvnh02w9jv0o9icvh88f,xyz,xyx,false,lfg,,[],[],0xB7FF4742e6E929e210f17c48E6a56df54BdAD1d0
54fdc5a9-75e8-4346-af9a-43e40ab98135,gg@j.com,did:privy:clx04ntlt00gvr51b8ajybgfn,vvv,v,true,,,[],[],0x8b5E4bA136D3a483aC9988C20CBF0018cC687E6f
66f6c970-e5d2-4103-a93f-b634784eaadc,swarajcaptain@gmail.com,did:privy:cltrx0v9n03bnx2xc71isbql9,swaraj test,sawrajtestingthis,false,swaraj,,[],[],0xb6A95b3Fc70Cbea4069e1370a93E4a0D8E3c9B40
672167ce-16f3-443b-b356-c3599ae175c7,yashlunagaria@gmail.com,did:privy:clr566zj001qyk10ggucppodk,Yash Lunagaria,yashluna,false,Chasing ikigai,,[],[],0x1b55174da19EAF62BDa96FfcEc35B09B7B40D6b9
6d8e70d3-c95f-43b1-9844-cdfb1e811242,Cassox@gmail.com,did:privy:clqmzi8nv008vkw0fvn0dbdnc,Jeffrey Tibbetts,cassox,false,Non-medical consumer implant design and body modification artist,,[],[],0x3D3c0B40daaED87D75FeB611BB5ac66Ebaa2E4Ae
6e291151-a55c-4a24-9e21-5e8067401e62,VaporAviator@gmail.com,did:privy:clt82feav09zb203c94l46sbd,VaporAviator,vaporaviator,false,Inventor for the better world.,,[],[],0xD00F24c1d859edBc23311E802C32B76274367e8D
74633faf-448a-4630-8011-0c65c5ce5859,michellekellywu@gmail.com,did:privy:clr9dixlj00ddl70f34snxj2n,michelle,michelle,false,michelle,https://uofqdqrrquswprylyzby.supabase.co/storage/v1/object/public/campaigns/526IMG_2972.jpeg,[],[],0xF4a404C0757c40213c2Ba7cAa138Ee2f14db372d
777a0a15-ec51-45a9-a107-84f1064e8cd5,s.a.hewat@gmail.com,did:privy:clskwd8gn05ev517d276xg4kr,Simon Hewat,sahewat,false,,,[],[],0x7F8bD47f61ed6937689921Cb85a9f21F7c61E1a3
86f41643-a73f-4c83-aa4d-555a0cb5c785,TheHashSlayer@gmail.com,did:privy:clxyy2csg018lbqc8xvee9nyx,mekail,mekail,false,Cliff diver gone governance maxi,,[],[],0x537AFb1bB98386D41Fe5f4472C505d6BAec9e3D2
8735b072-2102-4aef-b64a-ace0b33feaf5,ThomasColwell@proton.me,did:privy:cm169e8oj01uppxsmk3xf7mov,Smiley Face,smileyface,false,,,[],[],0xfe37b74be206C3ADF8f342f56B86Eec97c0F0394
8874da72-a26b-4080-b0d4-e38a2b14a12c,iamgorgasiagian@gmail.com,did:privy:clzl5ut5i00nx5s4tpbpjd93d,Gorga Siagian,gorgasiagian,false,,,[],[],0x04145F4Fd42b2D63D273A49D298a65A151bE4Cb0
9ff95938-4a97-4b23-909f-a1438508acf8,jasonhartgrave@gmail.com,did:privy:clr6imj01002fjh0fpx2pt7um,Jason,mind4u2cn,false,"Network  State Maximalist with a side of DeSci, Daos, and ❤️",,[],[],0x9141dFE96Aa7175Cfa84aE9b357f5515d4E02320
a3c52e7e-8e21-47ce-893e-88c75570cba7,patricia@opencivics.co,did:privy:clzj373k70am0yuz60luji7aj,Patricia Parkinson,pparkinson,false,,,[],[],0x733Fe4b4D26168532c668231d725C46C315c14b1
a968e336-44e8-44ce-bc18-f53810eddd41,shizudio.eth@gmail.com,did:privy:clqfaqc5101fji50fyj25ihln,shina ,shizudio,false,Trying out viaprize!,,[],[],0xd7dA52eC53025C7cD40f22B793D468ab9B3E1d01
ae54ca75-5fcb-445f-b612-4519e34f487a,mjm@maearth.com,did:privy:cm1p9k9s702t5gzaju5pfyqk7,Ma Earth,maearth,false,,,[],[],0x617B7ab789bafF8B7c4d641d18e2fc42d1e1666e
b4bd89b6-c855-481d-b451-de85fff85a60,renee.daoscience@gmail.com,did:privy:cltbo5g0t0021ogjk11h00g0g,ren,reneedaos,false,,,[],[],0x44571D865D879bA75d8eaBb4a08c01Cc3Fc36D3F
b4e71180-10b7-4ea7-b56d-d28b04dbcdd4,kelseyfaith2024@gmail.com,did:privy:clrvvfjyx02yojr0pqao44irs,kelseyfaith24,kelseyfaith24,false,Nature & Community,,[],[],0xA48d2Eda9EA81D5d127396b508aF378e025Fd258
b7938c99-019b-42f5-8477-0cb2e3c691af,benjaminparish6@gmail.com,did:privy:clzh8h53t023vf2nw0h7hxkm2,Ani Peter Benjamin,vortex,false,,,[],[],0x717d295240218528771AF05f6d1985095F0B1ac7
ba68c5f9-a26e-4362-801f-95051c114c5c,thenvnsahu@gmail.com,did:privy:clri3jrw80261la0f2i8zgf7q,Naveen,nvnx,false,super shadowy self-taught coder,,[],[],0xECfC94a0DDfa90c35De3d91cf96792CE81e2808C
c1d024d0-769b-4aa2-b126-ab61360129f2,webmans@gmail.com,did:privy:clt9m8s6j0awxmq9x6x16yx8c,Mike chen,keeplooking,false,An crypto angel investor.,,[],[],0x3a7A2554b98577ef723424bB3e0aB99b80eD4C12
c44e9aed-f09c-4280-9165-b69a75c61592,sianoi@web3savannah.io,did:privy:clz33dq42046z17rzsi2mneh3,Sianoi Kimari,sianoi,false,,,[],[],0x1589570179e9c08EF62CC14d6160D7CD199B60F2
cd14e113-b80e-4197-89df-bc5237f7a937,jonason@protonmail.ch,did:privy:clu9okvgf0c0x11el1e5lcz3t,haessig,jonas,false,"Philosopher, Historian of Knowledge, Librarian",https://uofqdqrrquswprylyzby.supabase.co/storage/v1/object/public/campaigns/2631663126058977.jpg,"[],Design,Writing,Research,AI,Python,Translation","[],Open-Source,Education,Community Coordination,Network Civilizations",0x8F688936bA025d4d16950299a2809549f595e853
cda75bf9-7250-41ed-98db-82a2ed89bdd9,brian.li.101@gmail.com,did:privy:cluelsoz902l5147yyq9m7ppz,Brian Li,bli,false,,,[],[],0x88F667664E61221160ddc0414868eF2f40e83324
d362cfbb-b7ce-4acd-9d43-63b1772a8250,ajiboladavid0963@gmail.com,did:privy:cltcxrpko04l3we4bnqspvuxk,David Ajibola,david,false,,,[],[],0xc2F85BE6D2987Ba7759E9FAD354EA4C9713b86a0
d5a10dc3-63b6-4f21-b0d4-40e15e33c8f5,testtest200526@gmail.com,did:privy:clqjrd7800111jm0fx6dz2whu,Dipanshu CoinBase Test,,false,Nothing much ,,[],[],0x70C0911B994770fc56Bccab8e0E00e90177a74c1
dcc22ef5-ce07-418e-9dd6-9768958a3085,test@gmail.com,did:privy:clpxz9ihq00djk00f2h06nto6,whizzy,swaraj,true,....,https://uofqdqrrquswprylyzby.supabase.co/storage/v1/object/public/campaigns/183liang-xing-art-anime-vzglyad.jpg,"Python,Design,Translation,Real estate",,0x725a687163699e172DebC4763A4b87156B87a9e2
e9376bcf-b304-4b0f-9921-c1617c19b7fc,james@gmail.com,did:privy:cm1ot4hbi0b7z12urbwkh4j91,james,kingjames,false,,,[],[],0x65741138F6B2629D34aBA703Aec18bf799016820
ed817e1b-201c-4555-b23a-604dd7450338,aitheric@protonmail.com,did:privy:clrfuaat000eml50f1e2mczua,Tristan Roberts,aitheric,false,Desci fanboy,,[],[],0x262b4F07e42BBc33F597fcf0d854e9DAFaf3D469
f195dd52-8295-468a-b3b4-4e10da215a2f,artem@harmonica.chat,did:privy:cm02gvptg06g1s6e298f4rs1a,Artem Zhiganov,zhiganov,false,,,[],[],0x52efcAbfEE378D675a50644f4A2C05B741b009c1
f1c7a2cb-1676-40d5-9c48-378ac3fa3d1e,noahchonlee@gmail.com,did:privy:clnfhmdei0gsql50f80tcmka8,Noah Chon Lee,noahchonlee,true,Founder of viaPrize,https://uofqdqrrquswprylyzby.supabase.co/storage/v1/object/public/campaigns/946IMG_1970.JPG,"Writing,Research,AI,Meta","Network Civilizations,Community Coordination,Open-Source",0x850a146D7478dAAa98Fc26Fd85e6A24e50846A9d
f31cb4bf-a70a-4a20-a65d-767f5d56c366,gages-pampas.0e@icloud.com,did:privy:clriqql9o02nvjn0fr3j820wc,raj ,swarajmobile,false,I am viaprize dev ,,[],[],0x69aE76cA2b0C724800F131F184da37783A3F6317
fba4b9a2-68fc-47e7-ad48-94007b5d039c,tabufili.uhuholi@gotgel.org,did:privy:cls934dsr01xl9dgdjymxyr7p,musterman,max,false,I want to check this website out,,[],[],0x06d29407182B59e3b3259aaE5aE72EDCA6aEb608
`
function readCSVFromString(csvString: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    const readableStream = Readable.from([csvString]) // Convert the string to a readable stream

    readableStream
      .pipe(csv()) // Pipe the stream to csv-parser
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err))
  })
}

export const handler = async () => {
  const csvData = await readCSVFromString(csvString)

  for (const row of csvData) {
    await viaprize.users.onboardCustodialUser(
      {
        bio: row.bio,
        image: row.avatar,
        username: row.username,
        email: row.email,
        name: row.name,
        authId: row.authId,
      },
      row.walletAddress,
    )
  }

  return {
    statusCode: 200,
    body: 'Hi',
  }
}
