import { Controller, Get, Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

@Injectable()
class SmokeService {
	getValue() {
		return "ok";
	}
}

@Controller()
class SmokeController {
	constructor(private readonly svc: SmokeService) {}

	@Get()
	get() {
		return this.svc.getValue();
	}
}

@Module({
	controllers: [SmokeController],
	providers: [SmokeService],
})
class SmokeModule {}

describe("NestJS Vitest smoke (api)", () => {
	it("compiles a testing module with decorators and metadata", async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [SmokeModule],
		}).compile();

		const controller = moduleRef.get(SmokeController);
		expect(controller.get()).toBe("ok");
	});
});
