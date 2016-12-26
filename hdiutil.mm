#import <AppKit/AppKit.h>
#import <Security/Security.h>
#import <SecurityFoundation/SFAuthorization.h>
#import <nan.h>
#import <string>
#import <Cocoa/Cocoa.h>

class Authorize: public Nan::AsyncWorker {

	private:
		std::string prompt;
		std::string password;
		bool cancelled = false;

	public:

		Authorize(std::string prompt, Nan::Callback *callback): AsyncWorker(callback), prompt(prompt) {}
		~Authorize() {}

		void Execute() {

			NSString* title = [NSString stringWithUTF8String:prompt.c_str()];
			AuthorizationRights rights;
			AuthorizationEnvironment env;
			AuthorizationFlags flags(kAuthorizationFlagDefaults | kAuthorizationFlagInteractionAllowed | kAuthorizationFlagPreAuthorize);

			AuthorizationItem rightsItems[1] = { { "com.apple.builtin.generic-unlock", 0, NULL, 0 } };
			rights.count = sizeof(rightsItems) / sizeof(AuthorizationItem);
			rights.items = rightsItems;

			AuthorizationItem envItems[1] = { { kAuthorizationEnvironmentPrompt, strlen([title UTF8String]), (void *)[title UTF8String], 0 } };
			env.count = sizeof(envItems) / sizeof(AuthorizationItem);
			env.items = envItems;

			SFAuthorization *authorization = [SFAuthorization authorization];

			if (![authorization obtainWithRights:&rights flags:flags environment:&env authorizedRights:NULL error:NULL]) {
				cancelled = true;
				return;
			}

			AuthorizationItemSet *info;

			if (AuthorizationCopyInfo([authorization authorizationRef], kAuthorizationEnvironmentPassword, &info) == noErr &&
				info->count > 0 && info->items[0].valueLength > 0) password = std::string((char*)info->items[0].value);

			AuthorizationFreeItemSet(info);
		}

		void HandleOKCallback() {
			Nan::HandleScope scope;
			v8::Local<v8::Value> argv[] = {
				v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), password.c_str()),
				Nan::New<v8::Boolean>(cancelled)
			};
			callback->Call(2, argv);
		}

};

NAN_METHOD(authorize) {
	v8::String::Utf8Value prompt(Nan::To<v8::String>(info[0]).ToLocalChecked());
	Nan::AsyncQueueWorker(new Authorize(
		std::string(*prompt, prompt.length()),
		new Nan::Callback(info[1].As<v8::Function>())
	));
}

void Init(v8::Local<v8::Object> exports) {
	exports->Set(
		Nan::New("authorize").ToLocalChecked(),
		Nan::New<v8::FunctionTemplate>(authorize)->GetFunction()
	);
}

NODE_MODULE(hdiutil, Init)