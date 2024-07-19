import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {

    @IsInt()
    @IsPositive()
    @Min(1)
    //isInt, isPositive, min 1
    no: number;

    @IsString()
    @MinLength(1)
    // isString, Minlenth 1
    name: string;
}
