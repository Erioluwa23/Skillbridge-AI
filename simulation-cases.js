// Entirely fictional practice cases. The case facts and rubrics are reference data,
// not real customer information or a professional certification standard.
export const SIM_CASES = [
  {
    id: 'delivery-001', title: 'Investigate a delayed delivery', role: 'Customer Support Associate',
    company: 'SwiftMart Nigeria (fictional)', time: '12-18 min', category: 'Customer support',
    objective: 'Review a customer complaint, investigate the order record, and prepare a policy-compliant reply.',
    customer: 'Hello. I paid NGN 18,000 for my order five days ago. It has not arrived. I need to know what is happening.',
    resources: [
      {id:'message',name:'Customer message',badge:'Inbox',body:'From: Ada O.\nSubject: Missing order\n\nHello. I paid NGN 18,000 for my order five days ago. It has not arrived. I need to know what is happening. Please help.'},
      {id:'order',name:'Order record',badge:'Operations',body:'Order ID: SB-1042\nAmount: NGN 18,000\nPlaced: 5 days ago\nShipping: Standard delivery\nStatus: Delivery attempted yesterday\nCarrier note: Address confirmation pending\nRefund status: No request opened'},
      {id:'policy',name:'Delivery policy',badge:'Policy',body:'When a delivery attempt fails, confirm the customer\'s address and preferred contact details before escalating to the courier. Do not promise an exact delivery date, replacement, or refund until verification is complete. Never request bank PINs or passwords.'}
    ],
    decisions:[
      'Confirm the delivery address, then escalate the failed attempt to the courier.',
      'Promise a full refund today without investigating.',
      'Tell the customer it is their fault and close the case.'
    ], correctDecision:0,
    example:'I am sorry your parcel has not arrived. I checked order SB-1042, and the carrier recorded an attempted delivery. Could you confirm the delivery address and a suitable contact method? Once confirmed, I will raise this with the delivery team and update you on the next steps. Thank you for your patience.',
    rubric:[
      {id:'empathy',title:'Acknowledges the concern',weight:20,terms:['sorry','understand','apolog','concern','frustrat']},
      {id:'evidence',title:'Uses the order record',weight:25,terms:['attempt','order','sb-1042','carrier','delivery']},
      {id:'policy',title:'Follows the company policy',weight:25,terms:['address','confirm','verify']},
      {id:'next',title:'Explains a realistic next step',weight:20,terms:['escalat','contact','courier','follow up','update','raise']},
      {id:'professional',title:'Communicates professionally',weight:10,terms:['please','thank','could you','kindly']}
    ],
    warning:'Promising a guaranteed refund or delivery date before checking the facts conflicts with the policy.'
  },
  {
    id:'returns-002', title:'Handle a return request fairly', role:'Customer Support Associate',
    company:'SwiftMart Nigeria (fictional)', time:'12-18 min', category:'Customer support',
    objective:'Explain a return process clearly without guaranteeing an outcome that needs verification.',
    customer:'I ordered a shirt but the size is wrong. I want my money back right now.',
    resources:[
      {id:'message',name:'Customer message',badge:'Inbox',body:'From: Emeka I.\nSubject: Wrong size\n\nI ordered a shirt but the size is wrong. I want my money back right now.'},
      {id:'order',name:'Order record',badge:'Operations',body:'Order ID: SB-1088\nAmount: NGN 9,500\nDelivery date: Two days ago\nOrder status: Delivered\nReturn request: Not submitted\nCondition check: Not completed'},
      {id:'policy',name:'Returns policy',badge:'Policy',body:'A customer must submit a return request within seven days of delivery. Refund eligibility is assessed after the item condition is checked. Explain the return process and avoid guaranteeing immediate refunds. Never ask for card PINs or passwords.'}
    ],
    decisions:[
      'Explain how to submit a return request and what happens during review.',
      'Guarantee a full refund immediately.',
      'Reject the request without checking the return policy.'
    ], correctDecision:0,
    example:'I understand the frustration of receiving the wrong size. Your order SB-1088 was delivered two days ago. Please submit a return request using the order page. Our team will review the item condition and confirm the next steps. I cannot guarantee a refund before that review, but I can help you start the request.',
    rubric:[
      {id:'empathy',title:'Acknowledges the request respectfully',weight:20,terms:['sorry','understand','frustrat','apolog','concern']},
      {id:'evidence',title:'References the correct order details',weight:20,terms:['order','sb-1088','deliver','two days']},
      {id:'policy',title:'Explains the return-review policy',weight:30,terms:['return request','submit','review','condition']},
      {id:'next',title:'Provides a clear next step',weight:20,terms:['submit','open','request','start','visit']},
      {id:'professional',title:'Uses courteous language',weight:10,terms:['please','thank','happy to help','can help']}
    ],
    warning:'The policy requires a return request and a condition review before deciding on eligibility.'
  }
];