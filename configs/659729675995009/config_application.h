#define ACTIVATION_MODE     		OTAA
#define CLASS						CLASS-A
#define SPREADING_FACTOR    		SF7
#define ADAPTIVE_DR         		false
#define CONFIRMED           		false
#define APP_PORT                	15

#define SEND_BY_PUSH_BUTTON 		false
#define FRAME_DELAY         		10
#define PAYLOAD_HELLO				false
#define PAYLOAD_TEMPERATURE    		false
#define PAYLOAD_HUMIDITY   		true
#define CAYENNE_LPP_         		false
#define LOW_POWER           		false


#define devEUI_						{ 0xbc, 0x05, 0x56, 0x9d, 0x9f, 0xe4, 0x58, 0x78 }

// Configuration for ABP Activation Mode
#define devAddr_ 					( uint32_t )0x980b4f69
#define nwkSKey_ 					6c,d3,0c,24,58,bb,26,6e,c1,3a,c9,2b,4f,71,a3,e3
#define appSKey_ 					af,86,a8,b9,39,43,34,94,8e,02,f1,15,33,af,00,73


// Configuration for OTAA Activation Mode
#define appKey_						06,43,A2,9F,14,20,CE,1C,A7,96,80,4C,55,B7,45,6F
#define appEUI_						{ 0xf6, 0xc2, 0xd4, 0x5e, 0x71, 0xed, 0xa5, 0xd5 }

