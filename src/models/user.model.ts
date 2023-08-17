interface IGateway {
  parseSkinCode(data: string): string;
}

export class User {
  latinName: string;
  nativeName: string;

  skinCode: string;

  public formatUserData(formater: (data: string) => string): string {
    return `${this.latinName}_${formater(this.nativeName)}`;
  }

  public useWeapon(): this {
    return this;
  }

  public useArmor(): this {
    return this;
  }

  public parseSkinCode(providerGateway: IGateway): string {
    const parsed = providerGateway.parseSkinCode(this.skinCode);

    return `${parsed}_${this.skinCode}`;
  }
}

const mockProvider = {} as IGateway;

mockProvider.on("parseSkinCode").returns("white");

const user = new User();

user.useArmor().useWeapon();

const parsedUserSkin = user.parseSkinCode(mockProvider);

expect(parsedUserSkin).to.be.equal("white");
