export abstract class BaseModel {
    public constructor(input?: Partial<BaseModel>) {
        this.assign(input);
    }

    protected assign(input?: Partial<BaseModel>): void {
        Object.assign(this, input);
    }
}
